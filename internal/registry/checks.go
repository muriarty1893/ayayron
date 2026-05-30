package registry

import (
	"os/exec"
	"strings"
)

// CheckCmds maps tool config keys to shell commands that print the installed version.
var CheckCmds = map[string]string{
	"git":         "git --version",
	"curl":        "curl --version",
	"wget":        "wget --version",
	"jq":          "jq --version",
	"fzf":         "fzf --version",
	"bat":         "bat --version",
	"tree":        "tree --version",
	"htop":        "htop --version",
	"tmux":        "tmux -V",
	"make":        "make --version",
	"cmake":       "cmake --version",
	"go":          "go version",
	"golang":      "go version",
	"rust":        "rustc --version",
	"python3":     "python3 --version",
	"python":      "python3 --version",
	"java":        "java --version",
	"node":        "node --version",
	"nvm":         "[ -s $HOME/.nvm/nvm.sh ]",
	"yarn":        "yarn --version",
	"pnpm":        "pnpm --version",
	"docker":      "docker --version",
	"docker-cli":  "docker --version",
	"kubectl":     "kubectl version --client --short",
	"helm":        "helm version --short",
	"terraform":   "terraform version",
	"aws-cli":     "aws --version",
	"gcloud":      "gcloud --version",
	"vscode":      "code --version",
	"neovim":      "nvim --version",
	"vim":         "vim --version",
	"nano":        "nano --version",
	"starship":    "starship --version",
	"zoxide":      "zoxide --version",
	"sqlite3":     "sqlite3 --version",
	"postgresql":  "psql --version",
	"redis-tools": "redis-cli --version",
	"ripgrep":     "rg --version",
	"github-cli":  "gh --version",
	"lazygit":     "lazygit --version",
	"delta":       "delta --version",
	"hugo":        "hugo version",
	"pandoc":      "pandoc --version",
	"httpie":      "http --version",
	"mkcert":      "mkcert -version",
	"k9s":         "k9s version --short",
	"kind":        "kind version",
	"vault":       "vault --version",
	"packer":      "packer --version",
	"rclone":      "rclone --version",
	"direnv":      "direnv --version",
	"just":        "just --version",
	"ffmpeg":      "ffmpeg -version",
	"claude-code": "claude --version",
	"composer":    "composer --version",
	"maven":       "mvn --version",
	"gradle":      "gradle --version",
	"kitty":       "kitty --version",
	"ghostty":     "ghostty --version",
	"btop":        "btop --version",
	"copyq":       "copyq --version",
	"obs-studio":  "obs --version",
}

func init() {
	CheckCmds["illogical-impulse"] = `[ -d "$HOME/.config/quickshell/ii" ] || [ -d "$HOME/.cache/dots-hyprland" ]`
	CheckCmds["tmux-general"] = `[ -f "$HOME/.tmux.conf" ] && grep -q "history-limit 50000" "$HOME/.tmux.conf"`
	CheckCmds["tmux-vim-keys"] = `[ -f "$HOME/.tmux.conf" ] && grep -q "mode-keys vi" "$HOME/.tmux.conf"`
	CheckCmds["tmux-dracula"] = `[ -f "$HOME/.tmux.conf" ] && grep -q "dracula/tmux" "$HOME/.tmux.conf"`
	CheckCmds["tmux-catppuccin"] = `[ -f "$HOME/.tmux.conf" ] && grep -q "catppuccin/tmux" "$HOME/.tmux.conf"`
	CheckCmds["tmux-oh-my-tmux"] = `[ -f "$HOME/.tmux/.tmux.conf.local" ] || [ -f "$HOME/.tmux.conf.local" ]`
	CheckCmds["localsend"] = `command -v localsend >/dev/null 2>&1 || command -v localsend_app >/dev/null 2>&1 || [ -d /snap/localsend ]`
	CheckCmds["autokey"] = `command -v autokey >/dev/null 2>&1 || command -v autokey-gtk >/dev/null 2>&1`
	CheckCmds["brave-browser"] = `command -v brave-browser >/dev/null 2>&1 || [ -d "/Applications/Brave Browser.app" ]`
	CheckCmds["anydesk"] = `command -v anydesk >/dev/null 2>&1 || [ -d "/Applications/AnyDesk.app" ]`
	CheckCmds["moonlight"] = `command -v moonlight >/dev/null 2>&1 || [ -d /snap/moonlight ] || [ -d "/Applications/Moonlight.app" ]`
	CheckCmds["obsidian"] = `command -v obsidian >/dev/null 2>&1 || [ -d /snap/obsidian ] || [ -d "/Applications/Obsidian.app" ]`
	CheckCmds["obs-virtual-camera"] = `dpkg -l v4l2loopback-dkms 2>/dev/null | grep -q "^ii"`
	CheckCmds["whatsapp-web"] = `command -v unofficial-whatsapp >/dev/null 2>&1 || [ -d /snap/unofficial-whatsapp ]`
	CheckCmds["whatsapp"] = `[ -d "/Applications/WhatsApp.app" ]`
	CheckCmds["font-fira-code-nerd-font"] = `[ -d "$HOME/.local/share/fonts/NerdFonts/FiraCode" ] || ls "$HOME/Library/Fonts"/*Fira*Code* >/dev/null 2>&1`
	CheckCmds["font-cascadia-code-nerd-font"] = `[ -d "$HOME/.local/share/fonts/NerdFonts/CascadiaCode" ] || ls "$HOME/Library/Fonts"/*Cascadia* >/dev/null 2>&1`
	CheckCmds["font-jetbrains-mono-nerd-font"] = `[ -d "$HOME/.local/share/fonts/NerdFonts/JetBrainsMono" ] || ls "$HOME/Library/Fonts"/*JetBrains* >/dev/null 2>&1`
	CheckCmds["font-hack-nerd-font"] = `[ -d "$HOME/.local/share/fonts/NerdFonts/Hack" ] || ls "$HOME/Library/Fonts"/*Hack* >/dev/null 2>&1`
}

// DetectTool checks if the tool with the given key is installed.
// Returns (isInstalled, version string).
func DetectTool(key string) (bool, string) {
	cmd, ok := CheckCmds[key]
	if !ok {
		return false, ""
	}
	if shouldRunInShell(cmd) {
		c := exec.Command("sh", "-c", cmd) //nolint:gosec
		return c.Run() == nil, ""
	}
	parts := strings.Fields(cmd)
	c := exec.Command(parts[0], parts[1:]...) //nolint:gosec
	out, err := c.Output()
	if err != nil {
		return false, ""
	}
	version := strings.TrimSpace(strings.SplitN(string(out), "\n", 2)[0])
	return true, version
}

func shouldRunInShell(cmd string) bool {
	for _, token := range []string{"[", "||", "&&", "|", "$", "*", "\"", "'"} {
		if strings.Contains(cmd, token) {
			return true
		}
	}
	return false
}
