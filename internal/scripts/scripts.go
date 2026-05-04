package scripts

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// ReadConfig returns the embedded config file bytes for the given platform.
func ReadConfig(platform string) ([]byte, error) {
	name := configName(platform)
	if name == "" {
		return nil, fmt.Errorf("unsupported platform: %s", platform)
	}
	return FS.ReadFile("files/" + name)
}

// ExtractToTemp writes the platform script and default config to a temp directory.
// It returns the directory path, the script path, and a cleanup function.
func ExtractToTemp(platform string) (dir string, scriptPath string, cleanup func(), err error) {
	dir, err = os.MkdirTemp("", "ayayron-*")
	if err != nil {
		return "", "", nil, fmt.Errorf("create temp dir: %w", err)
	}
	cleanup = func() { os.RemoveAll(dir) }

	scriptFile := scriptName(platform)
	configFile := configName(platform)
	if scriptFile == "" || configFile == "" {
		cleanup()
		return "", "", nil, fmt.Errorf("unsupported platform: %s", platform)
	}

	for _, name := range []string{scriptFile, configFile} {
		data, readErr := FS.ReadFile("files/" + name)
		if readErr != nil {
			cleanup()
			return "", "", nil, fmt.Errorf("read embedded %s: %w", name, readErr)
		}
		dest := filepath.Join(dir, name)
		perm := os.FileMode(0644)
		if strings.HasSuffix(name, ".sh") || strings.HasSuffix(name, ".ps1") {
			perm = 0755
		}
		if writeErr := os.WriteFile(dest, data, perm); writeErr != nil {
			cleanup()
			return "", "", nil, fmt.Errorf("write %s: %w", name, writeErr)
		}
	}

	scriptPath = filepath.Join(dir, scriptFile)
	return dir, scriptPath, cleanup, nil
}

// GenerateConfig rewrites the base config so that only tools whose IDs are in
// enabledIDs have value=true. Section headers and comment lines are preserved.
// Tool IDs have the format "Section.key" (e.g. "UserLevel.CoreTools.git").
func GenerateConfig(baseConfig []byte, enabledIDs map[string]bool) ([]byte, error) {
	var out bytes.Buffer
	scanner := bufio.NewScanner(bytes.NewReader(baseConfig))
	currentSection := ""

	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)

		// Section header
		if strings.HasPrefix(trimmed, "[") && strings.HasSuffix(trimmed, "]") {
			currentSection = trimmed[1 : len(trimmed)-1]
			out.WriteString(line + "\n")
			continue
		}

		// Comment or blank line
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			out.WriteString(line + "\n")
			continue
		}

		// key=value line
		eqIdx := strings.IndexByte(trimmed, '=')
		if eqIdx < 0 {
			out.WriteString(line + "\n")
			continue
		}
		key := strings.TrimSpace(trimmed[:eqIdx])
		toolID := currentSection + "." + key
		if enabledIDs[toolID] {
			out.WriteString(key + "=true\n")
		} else {
			out.WriteString(key + "=false\n")
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("scan config: %w", err)
	}
	return out.Bytes(), nil
}

func scriptName(platform string) string {
	switch platform {
	case "linux":
		return "ubuntu.sh"
	case "darwin":
		return "macos.sh"
	case "windows":
		return "windows.ps1"
	}
	return ""
}

func configName(platform string) string {
	switch platform {
	case "linux":
		return "ubuntu.config"
	case "darwin":
		return "macos.config"
	case "windows":
		return "windows.config"
	}
	return ""
}
