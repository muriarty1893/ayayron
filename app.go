package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os/exec"
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
)

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

// GetPlatform returns "linux" or "windows".
func (a *App) GetPlatform() string {
	if runtime.GOOS == "windows" {
		return "windows"
	}
	return "linux"
}

// GetTools returns all tools with IsInstalled and Version populated.
func (a *App) GetTools() ([]models.Tool, error) {
	all := registry.All()
	platform := a.GetPlatform()
	result := make([]models.Tool, 0, len(all))
	for _, t := range all {
		if platform == "windows" && t.WindowsCmd == "" {
			continue
		}
		if platform == "linux" && t.LinuxCmd == "" {
			continue
		}
		t.IsInstalled, t.Version = detectTool(t.CheckCmd)
		result = append(result, t)
	}
	return result, nil
}

// GetProfiles returns all preset profiles.
func (a *App) GetProfiles() ([]models.Profile, error) {
	return registry.Profiles(), nil
}

// StartInstallation kicks off async installation of the given tool IDs.
// It emits Wails events as installation progresses and returns immediately.
func (a *App) StartInstallation(toolIDs []string) error {
	a.installMu.Lock()
	if a.cancelInstall != nil {
		a.installMu.Unlock()
		return fmt.Errorf("installation already in progress")
	}
	ctx, cancel := context.WithCancel(a.ctx)
	a.cancelInstall = cancel
	a.installMu.Unlock()

	allTools := registry.All()
	toolMap := make(map[string]models.Tool, len(allTools))
	for _, t := range allTools {
		toolMap[t.ID] = t
	}

	selected := make([]models.Tool, 0, len(toolIDs))
	for _, id := range toolIDs {
		if t, ok := toolMap[id]; ok {
			selected = append(selected, t)
		}
	}

	wailsruntime.EventsEmit(a.ctx, "install:start", map[string]interface{}{
		"total":   len(selected),
		"toolIds": toolIDs,
	})

	go func() {
		defer func() {
			a.installMu.Lock()
			a.cancelInstall = nil
			a.installMu.Unlock()
		}()

		var installed, failed, skipped int
		platform := a.GetPlatform()

		for i, tool := range selected {
			select {
			case <-ctx.Done():
				for j := i; j < len(selected); j++ {
					wailsruntime.EventsEmit(a.ctx, "install:toolDone", map[string]interface{}{
						"toolId":     selected[j].ID,
						"success":    false,
						"durationMs": int64(0),
					})
					skipped++
					a.installRepo.Create(selected[j].ID, selected[j].Name, models.StatusSkipped, "cancelled", 0) //nolint:errcheck
				}
				wailsruntime.EventsEmit(a.ctx, "install:done", map[string]interface{}{
					"installed": installed,
					"failed":    failed,
					"skipped":   skipped,
				})
				return
			default:
			}

			wailsruntime.EventsEmit(a.ctx, "install:progress", map[string]interface{}{
				"current":  i + 1,
				"total":    len(selected),
				"toolId":   tool.ID,
				"toolName": tool.Name,
			})

			var cmd string
			if platform == "linux" {
				cmd = tool.LinuxCmd
			} else {
				cmd = tool.WindowsCmd
			}

			if cmd == "" {
				wailsruntime.EventsEmit(a.ctx, "install:line", map[string]interface{}{
					"toolId":   tool.ID,
					"line":     fmt.Sprintf("No install command for %s on %s — skipping", tool.Name, platform),
					"isStderr": true,
				})
				wailsruntime.EventsEmit(a.ctx, "install:toolDone", map[string]interface{}{
					"toolId":     tool.ID,
					"success":    false,
					"durationMs": int64(0),
				})
				failed++
				a.installRepo.Create(tool.ID, tool.Name, models.StatusFailed, "no command for platform", 0) //nolint:errcheck
				continue
			}

			start := time.Now()
			output, err := runInstall(ctx, a.ctx, tool.ID, cmd, platform)
			durationMs := time.Since(start).Milliseconds()

			if err != nil {
				failed++
				a.installRepo.Create(tool.ID, tool.Name, models.StatusFailed, output, durationMs) //nolint:errcheck
				wailsruntime.EventsEmit(a.ctx, "install:toolDone", map[string]interface{}{
					"toolId":     tool.ID,
					"success":    false,
					"durationMs": durationMs,
				})
			} else {
				installed++
				a.installRepo.Create(tool.ID, tool.Name, models.StatusInstalled, output, durationMs) //nolint:errcheck
				wailsruntime.EventsEmit(a.ctx, "install:toolDone", map[string]interface{}{
					"toolId":     tool.ID,
					"success":    true,
					"durationMs": durationMs,
				})
			}
		}

		wailsruntime.EventsEmit(a.ctx, "install:done", map[string]interface{}{
			"installed": installed,
			"failed":    failed,
			"skipped":   skipped,
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

// detectTool runs checkCmd and returns (isInstalled, version).
func detectTool(checkCmd string) (bool, string) {
	if checkCmd == "" {
		return false, ""
	}
	// Shell-test form: [ -d $HOME/.oh-my-zsh ]
	if strings.HasPrefix(checkCmd, "[") {
		cmd := exec.Command("sh", "-c", checkCmd) //nolint:gosec
		return cmd.Run() == nil, ""
	}
	parts := strings.Fields(checkCmd)
	cmd := exec.Command(parts[0], parts[1:]...) //nolint:gosec
	out, err := cmd.Output()
	if err != nil {
		return false, ""
	}
	version := strings.TrimSpace(strings.SplitN(string(out), "\n", 2)[0])
	return true, version
}

// runInstall executes the install command in a shell, streaming output as Wails events.
// installCtx is cancelled when the user clicks Cancel.
func runInstall(installCtx, wailsCtx context.Context, toolID, cmd, platform string) (string, error) {
	var shellCmd *exec.Cmd
	if platform == "linux" {
		shellCmd = exec.CommandContext(installCtx, "bash", "-c", cmd) //nolint:gosec
		shellCmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	} else {
		shellCmd = exec.CommandContext(installCtx, "powershell", "-Command", cmd) //nolint:gosec
	}

	stdoutPipe, err := shellCmd.StdoutPipe()
	if err != nil {
		return "", fmt.Errorf("stdout pipe: %w", err)
	}
	stderrPipe, err := shellCmd.StderrPipe()
	if err != nil {
		return "", fmt.Errorf("stderr pipe: %w", err)
	}

	if err := shellCmd.Start(); err != nil {
		return "", fmt.Errorf("start: %w", err)
	}

	var mu sync.Mutex
	var output strings.Builder

	var wg sync.WaitGroup
	streamPipe := func(reader io.ReadCloser, isStderr bool) {
		defer wg.Done()
		scanner := bufio.NewScanner(reader)
		for scanner.Scan() {
			line := scanner.Text()
			mu.Lock()
			output.WriteString(line + "\n")
			mu.Unlock()
			wailsruntime.EventsEmit(wailsCtx, "install:line", map[string]interface{}{
				"toolId":   toolID,
				"line":     line,
				"isStderr": isStderr,
			})
		}
	}

	wg.Add(2)
	go streamPipe(stdoutPipe, false)
	go streamPipe(stderrPipe, true)
	wg.Wait()

	return output.String(), shellCmd.Wait()
}
