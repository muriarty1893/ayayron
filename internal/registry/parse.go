package registry

import (
	"bufio"
	"bytes"
	"strings"

	"ayayron/internal/models"
)

// sectionCategoryMap maps config section prefixes to UI categories.
var sectionCategoryMap = []struct {
	prefix   string
	category models.Category
}{
	{"UserLevel.Languages", models.CategoryLanguages},
	{"UserLevel.Databases", models.CategoryDatabases},
	{"AdminLevel.Databases", models.CategoryDatabases},
	{"UserLevel.Containers", models.CategoryCloud},
	{"UserLevel.Cloud", models.CategoryCloud},
	{"AdminLevel.Docker", models.CategoryCloud},
	{"UserLevel.Editors", models.CategoryEditors},
	{"AdminLevel.Editors", models.CategoryEditors},
	{"Applications.Development", models.CategoryEditors},
	{"UserLevel.Terminal", models.CategoryTerminal},
	{"UserLevel.TmuxConfig", models.CategoryTerminal},
	{"UserLevel.Dotfiles", models.CategoryDotfiles},
	{"UserLevel.DesktopApps", models.CategoryApps},
	{"UserLevel.Fonts", models.CategoryApps},
	{"AdminLevel.Fonts", models.CategoryApps},
	{"AdminLevel.Browsers", models.CategoryApps},
	{"AdminLevel.Multimedia", models.CategoryApps},
	{"Applications.", models.CategoryApps},
	// All remaining sections fall through to core
}

func sectionToCategory(section string) models.Category {
	for _, m := range sectionCategoryMap {
		if strings.HasPrefix(section, m.prefix) {
			return m.category
		}
	}
	return models.CategoryCore
}

// skipSections lists sections that contain settings, not installable tools.
var skipSections = map[string]bool{
	"General":            true,
	"SystemRequirements": true,
}

// humanize converts a config key like "github-cli" → "Github Cli".
func humanize(key string) string {
	parts := strings.FieldsFunc(key, func(r rune) bool { return r == '-' || r == '_' })
	for i, p := range parts {
		if len(p) > 0 {
			parts[i] = strings.ToUpper(p[:1]) + p[1:]
		}
	}
	return strings.Join(parts, " ")
}

// ParseConfig parses an INI-format config file and returns a slice of Tools.
func ParseConfig(data []byte, _ string) ([]models.Tool, error) {
	var tools []models.Tool
	scanner := bufio.NewScanner(bytes.NewReader(data))
	currentSection := ""

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Section header
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			currentSection = line[1 : len(line)-1]
			continue
		}

		// Skip blank lines and comments
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Skip non-tool sections
		if skipSections[currentSection] {
			continue
		}

		// key=value (strip inline comments)
		eqIdx := strings.IndexByte(line, '=')
		if eqIdx < 0 {
			continue
		}
		key := strings.TrimSpace(line[:eqIdx])
		rawVal := strings.TrimSpace(line[eqIdx+1:])
		// Strip inline comment
		if ci := strings.Index(rawVal, " #"); ci >= 0 {
			rawVal = strings.TrimSpace(rawVal[:ci])
		}
		value := rawVal

		// Determine permission level from section prefix
		permLevel := models.PermissionUser
		if strings.HasPrefix(currentSection, "AdminLevel") {
			permLevel = models.PermissionAdmin
		}

		id := currentSection + "." + key
		desc := DescriptionMap[key]
		name := humanize(key)
		category := sectionToCategory(currentSection)
		defaultEnabled := value == "true"

		var isInstalled bool
		var version string
		if permLevel == models.PermissionUser {
			isInstalled, version = DetectTool(key)
		}

		tools = append(tools, models.Tool{
			ID:              id,
			Name:            name,
			Description:     desc,
			Category:        category,
			Section:         currentSection,
			PermissionLevel: permLevel,
			DefaultEnabled:  defaultEnabled,
			RequiresSudo:    permLevel == models.PermissionAdmin,
			IsInstalled:     isInstalled,
			Version:         version,
		})
	}

	return tools, scanner.Err()
}

// Profiles returns the built-in preset profiles.
// ToolIDs reference the config key (short name), and are resolved to full IDs in app.go.
func Profiles() []models.Profile {
	return []models.Profile{
		{
			ID:   "minimal",
			Name: "Minimal Dev",
			Icon: "terminal",
			ToolIDs: []string{
				"UserLevel.CoreTools.git",
				"UserLevel.CoreTools.curl",
				"UserLevel.CoreTools.jq",
				"UserLevel.CoreTools.tree",
				"UserLevel.CoreTools.htop",
				"UserLevel.Editors.vim",
				"UserLevel.Terminal.tmux",
			},
		},
		{
			ID:   "fullstack-js",
			Name: "Full Stack JS",
			Icon: "code",
			ToolIDs: []string{
				"UserLevel.CoreTools.git",
				"UserLevel.CoreTools.curl",
				"UserLevel.CoreTools.jq",
				"UserLevel.Languages.NodeJS.nvm",
				"UserLevel.Languages.NodeJS.yarn",
				"UserLevel.Languages.NodeJS.pnpm",
				"UserLevel.Editors.vscode",
				"UserLevel.Containers.docker-compose",
				"UserLevel.Terminal.tmux",
			},
		},
		{
			ID:   "go-developer",
			Name: "Go Developer",
			Icon: "server",
			ToolIDs: []string{
				"UserLevel.CoreTools.git",
				"UserLevel.CoreTools.curl",
				"UserLevel.CoreTools.jq",
				"UserLevel.CoreTools.ripgrep",
				"UserLevel.Languages.Go.install",
				"UserLevel.Editors.neovim",
				"UserLevel.Containers.docker-compose",
				"UserLevel.Terminal.tmux",
				"UserLevel.Terminal.starship",
			},
		},
		{
			ID:   "data-science",
			Name: "Data Science",
			Icon: "chart",
			ToolIDs: []string{
				"UserLevel.CoreTools.git",
				"UserLevel.CoreTools.curl",
				"UserLevel.CoreTools.jq",
				"UserLevel.Languages.Python.install",
				"UserLevel.Languages.Python.pip-packages",
				"UserLevel.Editors.vscode",
				"UserLevel.Databases.sqlite3",
				"UserLevel.Terminal.tmux",
			},
		},
		{
			ID:   "personal-desktop",
			Name: "Personal Desktop",
			Icon: "terminal",
			ToolIDs: []string{
				"UserLevel.CoreTools.git",
				"UserLevel.CoreTools.curl",
				"UserLevel.CoreTools.ripgrep",
				"UserLevel.CoreTools.fzf",
				"UserLevel.CoreTools.bat",
				"UserLevel.Editors.neovim",
				"UserLevel.Editors.nano",
				"UserLevel.Terminal.starship",
				"UserLevel.Terminal.zoxide",
				"UserLevel.Terminal.tmux",
				"UserLevel.Terminal.kitty",
				"UserLevel.Terminal.ghostty",
				"UserLevel.Terminal.btop",
				"UserLevel.TmuxConfig.tmux-general",
				"UserLevel.TmuxConfig.tmux-vim-keys",
				"UserLevel.DesktopApps.localsend",
				"UserLevel.DesktopApps.autokey",
				"UserLevel.DesktopApps.brave-browser",
				"UserLevel.DesktopApps.copyq",
				"UserLevel.DesktopApps.anydesk",
				"UserLevel.DesktopApps.moonlight",
				"UserLevel.DesktopApps.obsidian",
				"UserLevel.DesktopApps.obs-studio",
				"UserLevel.DesktopApps.obs-virtual-camera",
				"UserLevel.DesktopApps.whatsapp-web",
				"UserLevel.Fonts.font-fira-code-nerd-font",
				"UserLevel.Fonts.font-cascadia-code-nerd-font",
				"UserLevel.Fonts.font-jetbrains-mono-nerd-font",
				"UserLevel.Fonts.font-hack-nerd-font",
				"Applications.Browsers.brave-browser",
				"Applications.Productivity.localsend",
				"Applications.Productivity.copyq",
				"Applications.Productivity.obsidian",
				"Applications.Communication.whatsapp",
				"Applications.Communication.anydesk",
				"Applications.Media.moonlight",
				"Applications.Media.obs",
			},
		},
	}
}
