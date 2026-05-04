package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"time"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"ayayron/internal/database"
	"ayayron/internal/models"
	"ayayron/internal/registry"
	"ayayron/internal/repository"
	"ayayron/internal/scripts"
)

var ansiRe = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)

type App struct {
	ctx           context.Context
	installRepo   *repository.InstallationRepo
	cancelInstall context.CancelFunc
	installMu     sync.Mutex
}

func NewApp() *App { return &App{} }

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db, err := database.Init()
	if err != nil {
		panic(fmt.Sprintf("database init failed: %v", err))
	}
	a.installRepo = repository.NewInstallationRepo(db)
}

// GetPlatform returns "linux", "darwin", or "windows".
func (a *App) GetPlatform() string {
	switch runtime.GOOS {
	case "windows":
		return "windows"
	case "darwin":
		return "darwin"
	default:
		return "linux"
	}
}

// GetTools parses the bundled config for the current platform and returns tools with
// IsInstalled/Version populated for well-known tools.
func (a *App) GetTools() ([]models.Tool, error) {
	platform := a.GetPlatform()
	configData, err := scripts.ReadConfig(platform)
	if err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}
	return registry.ParseConfig(configData, platform)
}

// GetProfiles returns the built-in preset profiles.
func (a *App) GetProfiles() ([]models.Profile, error) {
	return registry.Profiles(), nil
}

// StartInstallation kicks off async installation of the given tool IDs.
// IDs are in the format "Section.key" (e.g. "UserLevel.CoreTools.git").
func (a *App) StartInstallation(toolIDs []string) error {
	a.installMu.Lock()
	if a.cancelInstall != nil {
		a.installMu.Unlock()
		return fmt.Errorf("installation already in progress")
	}
	ctx, cancel := context.WithCancel(a.ctx)
	a.cancelInstall = cancel
	a.installMu.Unlock()

	platform := a.GetPlatform()

	// Build a set of selected IDs for fast lookup.
	selectedSet := make(map[string]bool, len(toolIDs))
	for _, id := range toolIDs {
		selectedSet[id] = true
	}

	// Separate user-level and admin/apps-level IDs.
	var userIDs, adminIDs []string
	for _, id := range toolIDs {
		if strings.HasPrefix(id, "AdminLevel") {
			adminIDs = append(adminIDs, id)
		} else if platform == "darwin" && strings.HasPrefix(id, "Applications.") {
			adminIDs = append(adminIDs, id) // macOS --apps pass
		} else {
			userIDs = append(userIDs, id)
		}
	}

	// Build short-name → full-ID reverse map for output parsing.
	shortToID := make(map[string]string, len(toolIDs))
	for _, id := range toolIDs {
		parts := strings.Split(id, ".")
		if len(parts) > 0 {
			key := strings.ToLower(parts[len(parts)-1])
			shortToID[key] = id
		}
	}

	totalPasses := 0
	if len(userIDs) > 0 {
		totalPasses++
	}
	if len(adminIDs) > 0 {
		totalPasses++
	}
	if totalPasses == 0 {
		return nil
	}

	wailsruntime.EventsEmit(a.ctx, "install:start", map[string]interface{}{
		"total":   len(toolIDs),
		"toolIds": toolIDs,
	})

	go func() {
		defer func() {
			a.installMu.Lock()
			a.cancelInstall = nil
			a.installMu.Unlock()
		}()

		configData, err := scripts.ReadConfig(platform)
		if err != nil {
			wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
				"toolId": "", "line": "Error: failed to read config: " + err.Error(), "isStderr": true,
			})
			wailsruntime.EventsEmit(a.ctx, "install:done", map[string]interface{}{
				"installed": 0, "failed": len(toolIDs), "skipped": 0,
			})
			return
		}

		_, scriptPath, cleanup, err := scripts.ExtractToTemp(platform)
		if err != nil {
			wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
				"toolId": "", "line": "Error: " + err.Error(), "isStderr": true,
			})
			wailsruntime.EventsEmit(a.ctx, "install:done", map[string]interface{}{
				"installed": 0, "failed": len(toolIDs), "skipped": 0,
			})
			return
		}
		defer cleanup()

		scriptDir := filepath.Dir(scriptPath)
		var totalInstalled, totalFailed, totalSkipped int

		runPass := func(passIDs []string, flag string) {
			// Generate a config with only this pass's tools enabled.
			enabledMap := make(map[string]bool, len(passIDs))
			for _, id := range passIDs {
				enabledMap[id] = true
			}
			modConfig, genErr := scripts.GenerateConfig(configData, enabledMap)
			if genErr != nil {
				wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
					"toolId": "", "line": "Error generating config: " + genErr.Error(), "isStderr": true,
				})
				totalFailed += len(passIDs)
				return
			}
			configPath := filepath.Join(scriptDir, "modified.config")
			if writeErr := os.WriteFile(configPath, modConfig, 0644); writeErr != nil {
				wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
					"toolId": "", "line": "Error writing config: " + writeErr.Error(), "isStderr": true,
				})
				totalFailed += len(passIDs)
				return
			}

			var cmd *exec.Cmd
			switch platform {
			case "linux":
				if flag == "--admin" {
					display := os.Getenv("DISPLAY")
					xauth := os.Getenv("XAUTHORITY")
					cmd = exec.CommandContext(ctx, "pkexec", //nolint:gosec
						"env",
						"DISPLAY="+display,
						"XAUTHORITY="+xauth,
						"bash", scriptPath, "--admin", "--config", configPath,
					)
				} else {
					cmd = exec.CommandContext(ctx, "bash", scriptPath, flag, "--config", configPath) //nolint:gosec
					cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
				}
			case "darwin":
				if flag == "--apps" {
					script := fmt.Sprintf(`do shell script "bash '%s' --apps --config '%s'" with administrator privileges`, scriptPath, configPath)
					cmd = exec.CommandContext(ctx, "osascript", "-e", script) //nolint:gosec
				} else {
					cmd = exec.CommandContext(ctx, "bash", scriptPath, flag, "--config", configPath) //nolint:gosec
					cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
				}
			case "windows":
				if flag == "-ToolsAdminRights" {
					psScript := fmt.Sprintf(`Start-Process powershell -Verb RunAs -ArgumentList '-ExecutionPolicy Bypass -File \"%s\" -ToolsAdminRights -ConfigFile \"%s\"' -Wait`, scriptPath, configPath)
					cmd = exec.CommandContext(ctx, "powershell", "-ExecutionPolicy", "Bypass", "-Command", psScript) //nolint:gosec
				} else {
					cmd = exec.CommandContext(ctx, "powershell", "-ExecutionPolicy", "Bypass", //nolint:gosec
						"-File", scriptPath, "-ToolsUserRights", "-ConfigFile", configPath,
					)
				}
			}

			if cmd == nil {
				return
			}

			stdout, pipeErr := cmd.StdoutPipe()
			if pipeErr != nil {
				wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
					"toolId": "", "line": "pipe error: " + pipeErr.Error(), "isStderr": true,
				})
				totalFailed += len(passIDs)
				return
			}
			stderr, pipeErr := cmd.StderrPipe()
			if pipeErr != nil {
				wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
					"toolId": "", "line": "pipe error: " + pipeErr.Error(), "isStderr": true,
				})
				totalFailed += len(passIDs)
				return
			}

			if startErr := cmd.Start(); startErr != nil {
				wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
					"toolId": "", "line": "start error: " + startErr.Error(), "isStderr": true,
				})
				totalFailed += len(passIDs)
				return
			}

			// Track which tools in this pass have received a done event.
			doneMu := sync.Mutex{}
			doneIDs := make(map[string]bool)
			start := time.Now()

			emitToolDone := func(toolID string, success bool) {
				doneMu.Lock()
				defer doneMu.Unlock()
				if doneIDs[toolID] {
					return
				}
				doneIDs[toolID] = true
				ms := time.Since(start).Milliseconds()
				status := models.StatusInstalled
				if !success {
					status = models.StatusFailed
				}
				// Extract tool name from ID (last segment)
				parts := strings.Split(toolID, ".")
				toolName := parts[len(parts)-1]
				a.installRepo.Create(toolID, toolName, status, "", ms) //nolint:errcheck
				wailsruntime.EventsEmit(a.ctx, "install:toolDone", map[string]interface{}{
					"toolId": toolID, "success": success, "durationMs": ms,
				})
				if success {
					totalInstalled++
				} else {
					totalFailed++
				}
			}

			var wg sync.WaitGroup
			streamPipe := func(reader io.ReadCloser, isStderr bool) {
				defer wg.Done()
				scanner := bufio.NewScanner(reader)
				for scanner.Scan() {
					raw := scanner.Text()
					line := ansiRe.ReplaceAllString(raw, "")

					// Emit the cleaned line to the terminal.
					wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
						"toolId": "", "line": line, "isStderr": isStderr,
					})

					// Parse ✓/✗ to emit per-tool done events.
					if strings.Contains(line, "✓") || strings.Contains(line, "✗") {
						success := strings.Contains(line, "✓")
						// Try to match a tool ID from the line.
						lower := strings.ToLower(line)
						for key, fullID := range shortToID {
							if strings.Contains(lower, key) {
								emitToolDone(fullID, success)
								break
							}
						}
					}
				}
			}

			wg.Add(2)
			go streamPipe(stdout, false)
			go streamPipe(stderr, true)
			wg.Wait()

			exitErr := cmd.Wait()

			// For any pass IDs that didn't get a toolDone event, emit success/failure based on exit code.
			for _, id := range passIDs {
				doneMu.Lock()
				alreadyDone := doneIDs[id]
				doneMu.Unlock()
				if !alreadyDone {
					emitToolDone(id, exitErr == nil)
				}
			}
		}

		if len(userIDs) > 0 {
			select {
			case <-ctx.Done():
				for _, id := range userIDs {
					parts := strings.Split(id, ".")
					toolName := parts[len(parts)-1]
					a.installRepo.Create(id, toolName, models.StatusSkipped, "cancelled", 0) //nolint:errcheck
					wailsruntime.EventsEmit(a.ctx, "install:toolDone", map[string]interface{}{
						"toolId": id, "success": false, "durationMs": int64(0),
					})
					totalSkipped++
				}
			default:
				flag := "--user"
				runPass(userIDs, flag)
			}
		}

		if len(adminIDs) > 0 {
			select {
			case <-ctx.Done():
				for _, id := range adminIDs {
					parts := strings.Split(id, ".")
					toolName := parts[len(parts)-1]
					a.installRepo.Create(id, toolName, models.StatusSkipped, "cancelled", 0) //nolint:errcheck
					wailsruntime.EventsEmit(a.ctx, "install:toolDone", map[string]interface{}{
						"toolId": id, "success": false, "durationMs": int64(0),
					})
					totalSkipped++
				}
			default:
				adminFlag := "--admin"
				if runtime.GOOS == "darwin" {
					adminFlag = "--apps"
				} else if runtime.GOOS == "windows" {
					adminFlag = "-ToolsAdminRights"
				}
				runPass(adminIDs, adminFlag)
			}
		}

		wailsruntime.EventsEmit(a.ctx, "install:done", map[string]interface{}{
			"installed": totalInstalled,
			"failed":    totalFailed,
			"skipped":   totalSkipped,
		})
	}()

	return nil
}

// CancelInstallation stops the in-progress installation.
func (a *App) CancelInstallation() error {
	a.installMu.Lock()
	defer a.installMu.Unlock()
	if a.cancelInstall == nil {
		return fmt.Errorf("no installation in progress")
	}
	a.cancelInstall()
	return nil
}

// GetInstallationHistory returns the most recent installation records.
func (a *App) GetInstallationHistory(limit int) ([]models.Installation, error) {
	return a.installRepo.List(limit)
}
