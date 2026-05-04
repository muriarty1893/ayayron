package registry

import (
	"strings"
	"testing"

	"ayayron/internal/models"
)

// ---- humanize ----

func TestHumanize(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"git", "Git"},
		{"github-cli", "Github Cli"},
		{"aws-cli", "Aws Cli"},
		{"docker-compose", "Docker Compose"},
		{"npm-global-packages", "Npm Global Packages"},
		{"pip-packages", "Pip Packages"},
		{"fd-find", "Fd Find"},
		{"build-essential", "Build Essential"},
		{"git_lfs", "Git Lfs"},
		{"install", "Install"},
		{"", ""},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := humanize(tt.input)
			if got != tt.want {
				t.Errorf("humanize(%q) = %q; want %q", tt.input, got, tt.want)
			}
		})
	}
}

// ---- sectionToCategory ----

func TestSectionToCategory(t *testing.T) {
	tests := []struct {
		section string
		want    models.Category
	}{
		{"UserLevel.CoreTools", models.CategoryCore},
		{"UserLevel.BuildEssentials", models.CategoryCore},
		{"UserLevel.VersionControl", models.CategoryCore},
		{"UserLevel.Utilities", models.CategoryCore},
		{"UserLevel.Documentation", models.CategoryCore},
		{"UserLevel.Testing", models.CategoryCore},
		{"AdminLevel.SystemPackages", models.CategoryCore},
		{"AdminLevel.SystemTools", models.CategoryCore},
		{"UserLevel.Languages.NodeJS", models.CategoryLanguages},
		{"UserLevel.Languages.Go", models.CategoryLanguages},
		{"UserLevel.Languages.Python", models.CategoryLanguages},
		{"UserLevel.Databases", models.CategoryDatabases},
		{"AdminLevel.Databases", models.CategoryDatabases},
		{"UserLevel.Containers", models.CategoryCloud},
		{"UserLevel.Cloud", models.CategoryCloud},
		{"AdminLevel.Docker", models.CategoryCloud},
		{"UserLevel.Editors", models.CategoryEditors},
		{"AdminLevel.Editors", models.CategoryEditors},
		{"Applications.Development", models.CategoryEditors},
		{"UserLevel.Terminal", models.CategoryTerminal},
		{"UserLevel.Fonts", models.CategoryApps},
		{"AdminLevel.Fonts", models.CategoryApps},
		{"AdminLevel.Browsers", models.CategoryApps},
		{"AdminLevel.Multimedia", models.CategoryApps},
		{"Applications.Browsers", models.CategoryApps},
		{"Applications.Productivity", models.CategoryApps},
		{"UserLevel.Security", models.CategoryCore},
		{"UnknownSection", models.CategoryCore},
	}

	for _, tt := range tests {
		t.Run(tt.section, func(t *testing.T) {
			got := sectionToCategory(tt.section)
			if got != tt.want {
				t.Errorf("sectionToCategory(%q) = %q; want %q", tt.section, got, tt.want)
			}
		})
	}
}

// ---- ParseConfig ----

var minimalConfig = []byte(`
[General]
MinimalInstall=false

[UserLevel.CoreTools]
git=true
curl=false

[AdminLevel.Databases]
postgresql=true
`)

func TestParseConfig_Basic(t *testing.T) {
	tools, err := ParseConfig(minimalConfig, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	// [General] must be skipped; expect exactly 3 tools.
	if len(tools) != 3 {
		t.Fatalf("expected 3 tools, got %d", len(tools))
	}
}

func TestParseConfig_ToolIDs(t *testing.T) {
	tools, err := ParseConfig(minimalConfig, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	byID := make(map[string]models.Tool, len(tools))
	for _, t := range tools {
		byID[t.ID] = t
	}

	if _, ok := byID["UserLevel.CoreTools.git"]; !ok {
		t.Error("expected tool UserLevel.CoreTools.git")
	}
	if _, ok := byID["UserLevel.CoreTools.curl"]; !ok {
		t.Error("expected tool UserLevel.CoreTools.curl")
	}
	if _, ok := byID["AdminLevel.Databases.postgresql"]; !ok {
		t.Error("expected tool AdminLevel.Databases.postgresql")
	}
}

func TestParseConfig_DefaultEnabled(t *testing.T) {
	tools, err := ParseConfig(minimalConfig, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	byID := make(map[string]models.Tool, len(tools))
	for _, t := range tools {
		byID[t.ID] = t
	}

	if !byID["UserLevel.CoreTools.git"].DefaultEnabled {
		t.Error("git should have DefaultEnabled=true")
	}
	if byID["UserLevel.CoreTools.curl"].DefaultEnabled {
		t.Error("curl should have DefaultEnabled=false")
	}
	if !byID["AdminLevel.Databases.postgresql"].DefaultEnabled {
		t.Error("postgresql should have DefaultEnabled=true")
	}
}

func TestParseConfig_PermissionLevel(t *testing.T) {
	tools, err := ParseConfig(minimalConfig, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	for _, tool := range tools {
		expectAdmin := strings.HasPrefix(tool.Section, "AdminLevel")
		if expectAdmin && tool.PermissionLevel != models.PermissionAdmin {
			t.Errorf("tool %s in AdminLevel section should have PermissionAdmin", tool.ID)
		}
		if !expectAdmin && tool.PermissionLevel != models.PermissionUser {
			t.Errorf("tool %s should have PermissionUser", tool.ID)
		}
	}
}

func TestParseConfig_RequiresSudo(t *testing.T) {
	tools, err := ParseConfig(minimalConfig, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	for _, tool := range tools {
		wantSudo := tool.PermissionLevel == models.PermissionAdmin
		if tool.RequiresSudo != wantSudo {
			t.Errorf("tool %s: RequiresSudo=%v but PermissionLevel=%v", tool.ID, tool.RequiresSudo, tool.PermissionLevel)
		}
	}
}

func TestParseConfig_SectionField(t *testing.T) {
	tools, err := ParseConfig(minimalConfig, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	for _, tool := range tools {
		if tool.Section == "" {
			t.Errorf("tool %s has empty Section", tool.ID)
		}
	}
}

func TestParseConfig_SkipsGeneralAndSystemRequirements(t *testing.T) {
	config := []byte(`
[General]
MinimalInstall=false
UpdatePackages=true

[SystemRequirements]
xcode-cli-tools=true

[UserLevel.CoreTools]
git=true
`)
	tools, err := ParseConfig(config, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}
	if len(tools) != 1 {
		t.Fatalf("expected 1 tool (git only), got %d", len(tools))
	}
	if tools[0].ID != "UserLevel.CoreTools.git" {
		t.Errorf("expected git, got %s", tools[0].ID)
	}
}

func TestParseConfig_InlineCommentStripped(t *testing.T) {
	config := []byte(`
[UserLevel.CoreTools]
nvm=true                        # Install NVM (installs Node.js LTS automatically)
`)
	tools, err := ParseConfig(config, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}
	if len(tools) != 1 {
		t.Fatalf("expected 1 tool, got %d", len(tools))
	}
	if !tools[0].DefaultEnabled {
		t.Error("nvm should be DefaultEnabled=true (inline comment should be stripped)")
	}
}

func TestParseConfig_EmptyInput(t *testing.T) {
	tools, err := ParseConfig([]byte{}, "linux")
	if err != nil {
		t.Fatalf("unexpected error on empty input: %v", err)
	}
	if len(tools) != 0 {
		t.Errorf("expected no tools for empty config, got %d", len(tools))
	}
}

func TestParseConfig_CategoryMapping(t *testing.T) {
	config := []byte(`
[UserLevel.CoreTools]
git=true

[UserLevel.Languages.Go]
install=true

[UserLevel.Databases]
sqlite3=true

[UserLevel.Containers]
docker-compose=true

[UserLevel.Editors]
neovim=true

[UserLevel.Terminal]
tmux=true

[Applications.Browsers]
firefox=true
`)
	tools, err := ParseConfig(config, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	byID := make(map[string]models.Tool, len(tools))
	for _, t := range tools {
		byID[t.ID] = t
	}

	cases := []struct {
		id   string
		want models.Category
	}{
		{"UserLevel.CoreTools.git", models.CategoryCore},
		{"UserLevel.Languages.Go.install", models.CategoryLanguages},
		{"UserLevel.Databases.sqlite3", models.CategoryDatabases},
		{"UserLevel.Containers.docker-compose", models.CategoryCloud},
		{"UserLevel.Editors.neovim", models.CategoryEditors},
		{"UserLevel.Terminal.tmux", models.CategoryTerminal},
		{"Applications.Browsers.firefox", models.CategoryApps},
	}
	for _, c := range cases {
		tool, ok := byID[c.id]
		if !ok {
			t.Errorf("tool %s not found", c.id)
			continue
		}
		if tool.Category != c.want {
			t.Errorf("tool %s: category=%q, want %q", c.id, tool.Category, c.want)
		}
	}
}

func TestParseConfig_DescriptionLookup(t *testing.T) {
	config := []byte(`
[UserLevel.CoreTools]
git=true
my-unknown-tool=true
`)
	tools, err := ParseConfig(config, "linux")
	if err != nil {
		t.Fatalf("ParseConfig: %v", err)
	}

	byID := make(map[string]models.Tool, len(tools))
	for _, t := range tools {
		byID[t.ID] = t
	}

	// git has a known description.
	git := byID["UserLevel.CoreTools.git"]
	if git.Description == "" {
		t.Error("expected non-empty description for git")
	}

	// Unknown tool gets empty description.
	unknown := byID["UserLevel.CoreTools.my-unknown-tool"]
	if unknown.Description != "" {
		t.Errorf("expected empty description for unknown tool, got %q", unknown.Description)
	}
}

// ---- Profiles ----

func TestProfiles_NonEmpty(t *testing.T) {
	profiles := Profiles()
	if len(profiles) == 0 {
		t.Fatal("Profiles() returned empty slice")
	}
}

func TestProfiles_UniqueIDs(t *testing.T) {
	seen := make(map[string]bool)
	for _, p := range Profiles() {
		if seen[p.ID] {
			t.Errorf("duplicate profile ID: %q", p.ID)
		}
		seen[p.ID] = true
	}
}

func TestProfiles_ToolIDFormat(t *testing.T) {
	for _, p := range Profiles() {
		for _, id := range p.ToolIDs {
			// All tool IDs must contain at least two dots (Section.SubSection.key format).
			if strings.Count(id, ".") < 2 {
				t.Errorf("profile %q tool ID %q has wrong format (expected Section.Sub.key)", p.ID, id)
			}
		}
	}
}

func TestProfiles_RequiredFields(t *testing.T) {
	for _, p := range Profiles() {
		if p.ID == "" {
			t.Error("profile with empty ID")
		}
		if p.Name == "" {
			t.Errorf("profile %q has empty Name", p.ID)
		}
		if len(p.ToolIDs) == 0 {
			t.Errorf("profile %q has no ToolIDs", p.ID)
		}
	}
}
