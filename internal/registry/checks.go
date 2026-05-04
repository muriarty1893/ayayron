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
}

// DetectTool checks if the tool with the given key is installed.
// Returns (isInstalled, version string).
func DetectTool(key string) (bool, string) {
	cmd, ok := CheckCmds[key]
	if !ok {
		return false, ""
	}
	// Shell-test form: [ -s $HOME/.nvm/nvm.sh ]
	if strings.HasPrefix(cmd, "[") {
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
