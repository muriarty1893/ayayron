package scripts

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// ---- ReadConfig ----

func TestReadConfig(t *testing.T) {
	tests := []struct {
		platform    string
		wantErr     bool
		wantContain string
	}{
		{"linux", false, "[UserLevel.CoreTools]"},
		{"darwin", false, "[UserLevel.CoreTools]"},
		{"windows", false, "[UserLevel.CoreTools]"},
		{"freebsd", true, ""},
		{"", true, ""},
	}

	for _, tt := range tests {
		t.Run(tt.platform, func(t *testing.T) {
			data, err := ReadConfig(tt.platform)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("ReadConfig(%q): expected error, got nil", tt.platform)
				}
				return
			}
			if err != nil {
				t.Fatalf("ReadConfig(%q): unexpected error: %v", tt.platform, err)
			}
			if len(data) == 0 {
				t.Fatal("ReadConfig returned empty data")
			}
			if tt.wantContain != "" && !strings.Contains(string(data), tt.wantContain) {
				t.Errorf("ReadConfig(%q): expected to contain %q", tt.platform, tt.wantContain)
			}
		})
	}
}

// ---- ExtractToTemp ----

func TestExtractToTemp_UnsupportedPlatform(t *testing.T) {
	_, _, _, err := ExtractToTemp("plan9")
	if err == nil {
		t.Fatal("expected error for unsupported platform, got nil")
	}
}

func TestExtractToTemp_Linux(t *testing.T) {
	dir, scriptPath, cleanup, err := ExtractToTemp("linux")
	if err != nil {
		t.Fatalf("ExtractToTemp(linux): %v", err)
	}
	defer cleanup()

	if dir == "" || scriptPath == "" {
		t.Fatal("dir or scriptPath is empty")
	}

	// Script file must exist and be executable.
	info, err := os.Stat(scriptPath)
	if err != nil {
		t.Fatalf("script file not found: %v", err)
	}
	if info.Mode()&0111 == 0 {
		t.Errorf("script file is not executable: mode %v", info.Mode())
	}

	// Config file must exist alongside the script.
	configPath := filepath.Join(dir, "ubuntu.config")
	if _, err := os.Stat(configPath); err != nil {
		t.Fatalf("config file not found: %v", err)
	}

	// Cleanup must remove the directory.
	cleanup()
	if _, err := os.Stat(dir); !os.IsNotExist(err) {
		t.Error("cleanup did not remove temp directory")
	}
}

func TestExtractToTemp_Darwin(t *testing.T) {
	dir, scriptPath, cleanup, err := ExtractToTemp("darwin")
	if err != nil {
		t.Fatalf("ExtractToTemp(darwin): %v", err)
	}
	defer cleanup()

	if !strings.HasSuffix(scriptPath, "macos.sh") {
		t.Errorf("expected macos.sh, got %q", scriptPath)
	}
	if _, err := os.Stat(filepath.Join(dir, "macos.config")); err != nil {
		t.Fatal("macos.config not extracted")
	}
}

func TestExtractToTemp_Windows(t *testing.T) {
	dir, scriptPath, cleanup, err := ExtractToTemp("windows")
	if err != nil {
		t.Fatalf("ExtractToTemp(windows): %v", err)
	}
	defer cleanup()

	if !strings.HasSuffix(scriptPath, "windows.ps1") {
		t.Errorf("expected windows.ps1, got %q", scriptPath)
	}
	if _, err := os.Stat(filepath.Join(dir, "windows.config")); err != nil {
		t.Fatal("windows.config not extracted")
	}
}

// ---- GenerateConfig ----

var sampleConfig = []byte(`# comment line
[General]
MinimalInstall=false

[UserLevel.CoreTools]
git=true
curl=true
wget=false

[UserLevel.Languages.Go]
install=true

[AdminLevel.Databases]
postgresql=false
`)

func TestGenerateConfig_EnableSelected(t *testing.T) {
	enabled := map[string]bool{
		"UserLevel.CoreTools.git":       true,
		"AdminLevel.Databases.postgresql": true,
	}

	out, err := GenerateConfig(sampleConfig, enabled)
	if err != nil {
		t.Fatalf("GenerateConfig: %v", err)
	}
	result := string(out)

	cases := []struct{ key, want string }{
		{"git=true", "enabled tool should be true"},
		{"curl=false", "unselected tool should be false"},
		{"wget=false", "unselected tool should be false"},
		{"install=false", "unselected tool should be false"},
		{"postgresql=true", "admin-level enabled tool should be true"},
	}
	for _, c := range cases {
		if !strings.Contains(result, c.key) {
			t.Errorf("%s: output missing %q\n%s", c.want, c.key, result)
		}
	}
}

func TestGenerateConfig_PreservesStructure(t *testing.T) {
	out, err := GenerateConfig(sampleConfig, map[string]bool{})
	if err != nil {
		t.Fatalf("GenerateConfig: %v", err)
	}
	result := string(out)

	// Section headers and comment lines must be preserved.
	for _, want := range []string{
		"# comment line",
		"[General]",
		"[UserLevel.CoreTools]",
		"[UserLevel.Languages.Go]",
		"[AdminLevel.Databases]",
	} {
		if !strings.Contains(result, want) {
			t.Errorf("GenerateConfig did not preserve %q", want)
		}
	}
}

func TestGenerateConfig_EmptyInput(t *testing.T) {
	out, err := GenerateConfig([]byte{}, map[string]bool{})
	if err != nil {
		t.Fatalf("unexpected error on empty input: %v", err)
	}
	if len(out) != 0 {
		t.Errorf("expected empty output, got %q", string(out))
	}
}

func TestGenerateConfig_AllEnabled(t *testing.T) {
	enabled := map[string]bool{
		"UserLevel.CoreTools.git":         true,
		"UserLevel.CoreTools.curl":        true,
		"UserLevel.CoreTools.wget":        true,
		"UserLevel.Languages.Go.install":  true,
		"AdminLevel.Databases.postgresql": true,
	}

	out, err := GenerateConfig(sampleConfig, enabled)
	if err != nil {
		t.Fatalf("GenerateConfig: %v", err)
	}
	result := string(out)

	// All actual tool keys must be true. [General] keys (e.g. MinimalInstall) are
	// not in enabledIDs, so they correctly become false — that's not a failure.
	for _, key := range []string{"git=true", "curl=true", "wget=true", "install=true", "postgresql=true"} {
		if !strings.Contains(result, key) {
			t.Errorf("expected %q in output:\n%s", key, result)
		}
	}
}

func TestGenerateConfig_NoneEnabled(t *testing.T) {
	out, err := GenerateConfig(sampleConfig, map[string]bool{})
	if err != nil {
		t.Fatalf("GenerateConfig: %v", err)
	}
	result := string(out)
	if strings.Contains(result, "=true") {
		t.Errorf("no tools enabled but found =true in output:\n%s", result)
	}
}

func TestGenerateConfig_GeneralSectionPassedThrough(t *testing.T) {
	// [General] keys like MinimalInstall have no Section prefix — they become
	// "General.MinimalInstall" which won't be in enabledIDs, so they become false.
	// This is acceptable behaviour; verify it is deterministic.
	out, err := GenerateConfig(sampleConfig, map[string]bool{})
	if err != nil {
		t.Fatalf("GenerateConfig: %v", err)
	}
	if !strings.Contains(string(out), "MinimalInstall=false") {
		t.Errorf("expected General.MinimalInstall to become false, got:\n%s", string(out))
	}
}
