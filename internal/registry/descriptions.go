package registry

// DescriptionMap provides human-readable descriptions for well-known tool keys.
var DescriptionMap = map[string]string{
	"git":            "Distributed version control system",
	"github-cli":     "GitHub CLI — manage PRs, issues, and repos from the terminal",
	"curl":           "Command-line tool for transferring data with URLs",
	"wget":           "Non-interactive network downloader",
	"jq":             "Lightweight command-line JSON processor",
	"yq":             "Command-line YAML/JSON/XML processor",
	"ripgrep":        "Fast recursive grep with regex support",
	"fd-find":        "Simple, fast alternative to find",
	"fzf":            "General-purpose command-line fuzzy finder",
	"bat":            "A cat clone with syntax highlighting and Git integration",
	"tree":           "Display directory structure as a tree",
	"htop":           "Interactive process viewer",
	"ncdu":           "Disk usage analyzer with an ncurses interface",
	"tldr":           "Simplified community-maintained man pages",
	"make":           "Build automation tool",
	"cmake":          "Cross-platform build system generator",
	"tmux":           "Terminal multiplexer — split windows and detach sessions",
	"screen":         "Terminal multiplexer with detach/reattach support",
	"nvm":            "Node Version Manager — install and switch Node.js versions",
	"yarn":           "Fast, reliable JavaScript package manager",
	"pnpm":           "Efficient JavaScript package manager using hard links",
	"python":         "Python 3 programming language runtime",
	"python3":        "Python 3 programming language runtime",
	"go":             "Go programming language and toolchain",
	"golang":         "Go programming language and toolchain",
	"rust":           "Systems programming language via rustup",
	"java":           "Java Development Kit (JDK)",
	"docker-cli":     "Docker command-line interface",
	"docker":         "Docker container platform",
	"docker-compose": "Multi-container Docker application orchestrator",
	"kubectl":        "Kubernetes command-line tool",
	"helm":           "Kubernetes package manager",
	"terraform":      "Infrastructure as code tool by HashiCorp",
	"aws-cli":        "Amazon Web Services command-line interface",
	"azure-cli":      "Microsoft Azure command-line interface",
	"gcloud":         "Google Cloud SDK command-line tools",
	"vscode":         "Visual Studio Code — lightweight code editor by Microsoft",
	"neovim":         "Hyperextensible Vim-based text editor",
	"vim":            "Highly configurable text editor",
	"nano":           "Simple terminal-based text editor",
	"starship":       "Minimal, fast, customizable shell prompt",
	"zoxide":         "Smarter cd — jump to frequent directories",
	"postgresql":     "Powerful open-source relational database",
	"mysql":          "Popular open-source relational database",
	"mysql-client":   "MySQL command-line client tools",
	"sqlite3":        "Self-contained, serverless SQL database engine",
	"redis-tools":    "Redis command-line client and utilities",
	"mongodb-tools":  "MongoDB database tools (mongodump, mongoexport, etc.)",
	"git-lfs":        "Git extension for versioning large files",
	"lazygit":        "Terminal UI for git commands",
	"delta":          "Syntax-highlighting pager for git diffs",
	"direnv":         "Load and unload environment variables per directory",
	"rclone":         "Sync files to and from cloud storage providers",
	"mkcert":         "Make locally trusted development certificates",
	"k9s":            "Terminal UI for Kubernetes cluster management",
	"kind":           "Run Kubernetes clusters in Docker containers",
	"minikube":       "Local Kubernetes cluster for development",
	"argocd-cli":     "Argo CD CLI for GitOps continuous delivery",
	"vault":          "HashiCorp Vault — secrets management",
	"consul":         "HashiCorp Consul — service mesh and discovery",
	"packer":         "HashiCorp Packer — build machine images",
	"hugo":           "Fast static site generator",
	"pandoc":         "Universal document format converter",
	"httpie":         "User-friendly HTTP client for the terminal",
	"nmap":           "Network exploration and security auditing tool",
	"openssl":        "Toolkit for TLS/SSL and cryptography",
	"maven":          "Java project build and dependency management",
	"gradle":         "Flexible build automation for JVM projects",
	"composer":       "Dependency manager for PHP",
	"bundler":        "Ruby gem dependency manager",
	"claude-code":    "Anthropic Claude Code CLI for AI-assisted coding",
	"ffmpeg":         "Complete multimedia framework for video/audio processing",
	"imagemagick":    "Image manipulation and conversion suite",
	"watchexec":      "Execute commands when files change",
	"just":           "Command runner — a modern make alternative",
	"iterm2":         "Feature-rich terminal emulator for macOS",
	"homebrew":       "The missing package manager for macOS",
}

func init() {
	DescriptionMap["illogical-impulse"] = "Hyprland dotfiles and Quickshell desktop configuration by end-4"
	DescriptionMap["tmux-general"] = "Practical tmux defaults: mouse, 1-based windows, large history, RGB color, reload binding"
	DescriptionMap["tmux-vim-keys"] = "Vim-style pane movement, resizing, and copy-mode keys"
	DescriptionMap["tmux-dracula"] = "Dracula tmux theme installed through tmux plugin manager"
	DescriptionMap["tmux-catppuccin"] = "Catppuccin tmux theme installed through tmux plugin manager"
	DescriptionMap["tmux-oh-my-tmux"] = "Oh my tmux by gpakosz: a full-featured tmux configuration"
	DescriptionMap["kitty"] = "Fast GPU-accelerated terminal emulator"
	DescriptionMap["ghostty"] = "Fast native terminal emulator by Mitchell Hashimoto"
	DescriptionMap["btop"] = "Resource monitor with CPU, memory, disk, network, and process views"
	DescriptionMap["localsend"] = "Local network file sharing app, similar to AirDrop"
	DescriptionMap["autokey"] = "Desktop automation and text expansion tool for Linux"
	DescriptionMap["brave-browser"] = "Privacy-focused Chromium-based web browser"
	DescriptionMap["copyq"] = "Clipboard manager with searchable history and scripting"
	DescriptionMap["anydesk"] = "Remote desktop client for support and unattended access"
	DescriptionMap["moonlight"] = "Game streaming client for Sunshine and GeForce hosts"
	DescriptionMap["obsidian"] = "Markdown knowledge base and note-taking app"
	DescriptionMap["obs-studio"] = "Video recording and live streaming studio"
	DescriptionMap["obs-virtual-camera"] = "Linux v4l2loopback drivers for OBS virtual camera"
	DescriptionMap["whatsapp-web"] = "Unofficial desktop wrapper for WhatsApp Web"
	DescriptionMap["whatsapp"] = "WhatsApp desktop app"
	DescriptionMap["font-fira-code-nerd-font"] = "FiraCode Nerd Font"
	DescriptionMap["font-cascadia-code-nerd-font"] = "Cascadia Code Nerd Font"
	DescriptionMap["font-jetbrains-mono-nerd-font"] = "JetBrains Mono Nerd Font"
	DescriptionMap["font-hack-nerd-font"] = "Hack Nerd Font"
}
