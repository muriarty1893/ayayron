#!/usr/bin/env bash
# setup-dev-environment-macos.sh
# Dynamic development environment setup for macOS with configuration file
# Config file: setup-dev-environment-macos.config
# Version: 1.0.0
#
# Changelog:
# v1.0.0 - Initial macOS setup script
#          Homebrew-based package management
#          Official NVM for Node.js LTS installation
#          Yarn via Corepack, pnpm via official installer
#          Support for Homebrew Casks (GUI applications)

set -e

# ============================================================================
# VARIABLES
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE=""
TOOLS_USER=false
TOOLS_APPS=false
FORCE_INSTALL=()

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} $1"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW} $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
}

print_error() {
    echo -e "${RED}  ✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}  ⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}  → $1${NC}"
}

print_gray() {
    echo -e "${GRAY}  → $1${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================================================
# CONFIG FILE PARSER
# ============================================================================

declare -A CONFIG

parse_config() {
    local file="$1"
    local section=""
    local subsection=""

    while IFS= read -r line || [ -n "$line" ]; do
        # Remove leading/trailing whitespace
        line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^# ]] && continue

        # Section header
        if [[ "$line" =~ ^\[(.+)\]$ ]]; then
            local full_section="${BASH_REMATCH[1]}"

            if [[ "$full_section" == "General" || "$full_section" == "SystemRequirements" ]]; then
                section="$full_section"
                subsection=""
            elif [[ "$full_section" =~ ^(UserLevel|Applications)\.(.+)$ ]]; then
                section="${BASH_REMATCH[1]}"
                subsection="${BASH_REMATCH[2]}"
            elif [[ "$full_section" =~ ^(UserLevel|Applications)$ ]]; then
                section="${BASH_REMATCH[1]}"
                subsection=""
            fi
            continue
        fi

        # Key=value
        if [[ "$line" =~ ^([^=]+)=(.+)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"

            # Remove inline comments
            value=$(echo "$value" | sed 's/#.*//' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
            key=$(echo "$key" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

            # Build config key
            if [ -n "$subsection" ]; then
                CONFIG["${section}.${subsection}.${key}"]="$value"
            elif [ -n "$section" ]; then
                CONFIG["${section}.${key}"]="$value"
            fi
        fi
    done < "$file"
}

get_config_value() {
    local key="$1"
    local default="${2:-false}"
    echo "${CONFIG[$key]:-$default}"
}

# ============================================================================
# HOMEBREW INSTALLATION
# ============================================================================

install_homebrew() {
    if command_exists brew; then
        print_success "Homebrew already installed"
        return
    fi

    print_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$HOME/.zprofile"
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi

    if command_exists brew; then
        print_success "Homebrew installed successfully"
    else
        print_error "Failed to install Homebrew"
        exit 1
    fi
}

# ============================================================================
# XCODE COMMAND LINE TOOLS
# ============================================================================

install_xcode_cli_tools() {
    if xcode-select -p &>/dev/null; then
        print_success "Xcode Command Line Tools already installed"
        return
    fi

    print_info "Installing Xcode Command Line Tools..."
    xcode-select --install
    print_warning "Please complete the Xcode CLI Tools installation dialog"
    print_warning "Then re-run this script"
    exit 0
}

# ============================================================================
# HOMEBREW PACKAGE INSTALLATION
# ============================================================================

install_brew_package() {
    local package="$1"
    local display_name="${2:-$package}"
    local should_install="${3:-true}"

    # Check ForceInstall list
    if [ ${#FORCE_INSTALL[@]} -gt 0 ]; then
        local found=false
        for tool in "${FORCE_INSTALL[@]}"; do
            if [ "$tool" == "$package" ] || [ "$tool" == "$display_name" ]; then
                found=true
                break
            fi
        done
        [ "$found" == false ] && return
        print_info "Force installing $display_name..."
    elif [ "$should_install" != "true" ]; then
        print_gray "Skipped $display_name (disabled in config)"
        return
    fi

    if brew list "$package" &>/dev/null; then
        print_success "$display_name already installed"
    else
        print_info "Installing $display_name..."
        brew install "$package" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            print_success "$display_name installed"
        else
            print_error "Failed to install $display_name"
        fi
    fi
}

install_brew_cask() {
    local cask="$1"
    local display_name="${2:-$cask}"
    local should_install="${3:-true}"

    [ "$should_install" != "true" ] && print_gray "Skipped $display_name (disabled in config)" && return

    if brew list --cask "$cask" &>/dev/null; then
        print_success "$display_name already installed"
    else
        print_info "Installing $display_name..."
        brew install --cask "$cask" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            print_success "$display_name installed"
        else
            print_error "Failed to install $display_name"
        fi
    fi
}

# ============================================================================
# NVM INSTALLATION
# ============================================================================

install_nvm() {
    local should_install="$1"

    [ "$should_install" != "true" ] && print_gray "Skipped NVM (disabled in config)" && return

    # Check if NVM is already installed
    if [ -d "$HOME/.nvm" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
        print_success "NVM already installed"
        # shellcheck disable=SC1091
        source "$HOME/.nvm/nvm.sh"
        local nvm_version=$(nvm --version 2>/dev/null)
        print_gray "Current version: $nvm_version"
        return
    fi

    print_info "Installing NVM (Node Version Manager)..."

    # Download and install NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/latest/install.sh | bash >/dev/null 2>&1

    if [ $? -eq 0 ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
        print_success "NVM installed successfully"

        # Load NVM
        export NVM_DIR="$HOME/.nvm"
        # shellcheck disable=SC1091
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        # Install LTS Node.js
        print_info "Installing Node.js LTS via NVM..."
        nvm install --lts >/dev/null 2>&1
        nvm use --lts >/dev/null 2>&1

        if command_exists node; then
            local node_version=$(node --version)
            print_success "Node.js $node_version installed"
            print_warning "Restart terminal or run: source ~/.zshrc (or ~/.bashrc)"
        else
            print_warning "Node.js installed but not in PATH yet"
            print_warning "Run: source ~/.zshrc && nvm use --lts"
        fi
    else
        print_error "Failed to install NVM"
        print_warning "Try manually: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/latest/install.sh | bash"
    fi
}

# ============================================================================
# YARN INSTALLATION
# ============================================================================

install_yarn() {
    local should_install="$1"

    [ "$should_install" != "true" ] && print_gray "Skipped Yarn (disabled in config)" && return

    if ! command_exists node; then
        print_error "Node.js not found. Install NVM/Node.js first."
        return
    fi

    if command_exists yarn; then
        print_success "Yarn already installed"
        return
    fi

    print_info "Installing Yarn via Corepack..."

    # Try Corepack first (built into Node.js 16.10+)
    corepack enable >/dev/null 2>&1
    corepack prepare yarn@stable --activate >/dev/null 2>&1

    if command_exists yarn; then
        print_success "Yarn installed via Corepack"
    else
        # Fallback to npm install
        print_warning "Corepack not available, using npm..."
        npm install -g yarn >/dev/null 2>&1
        if command_exists yarn; then
            print_success "Yarn installed via npm"
        else
            print_error "Failed to install Yarn"
        fi
    fi
}

# ============================================================================
# PNPM INSTALLATION
# ============================================================================

install_pnpm() {
    local should_install="$1"

    [ "$should_install" != "true" ] && print_gray "Skipped pnpm (disabled in config)" && return

    if ! command_exists node; then
        print_error "Node.js not found. Install NVM/Node.js first."
        return
    fi

    if command_exists pnpm; then
        print_success "pnpm already installed"
        return
    fi

    print_info "Installing pnpm via official installer..."

    curl -fsSL https://get.pnpm.io/install.sh | sh - >/dev/null 2>&1

    if [ $? -eq 0 ]; then
        print_success "pnpm installed successfully"
        print_warning "Restart terminal or run: source ~/.zshrc (or ~/.bashrc)"
    else
        print_error "Failed to install pnpm"
    fi
}

tmux_config_requested() {
    [ "$(get_config_value 'UserLevel.TmuxConfig.tmux-general')" == "true" ] || \
    [ "$(get_config_value 'UserLevel.TmuxConfig.tmux-vim-keys')" == "true" ] || \
    [ "$(get_config_value 'UserLevel.TmuxConfig.tmux-dracula')" == "true" ] || \
    [ "$(get_config_value 'UserLevel.TmuxConfig.tmux-catppuccin')" == "true" ] || \
    [ "$(get_config_value 'UserLevel.TmuxConfig.tmux-oh-my-tmux')" == "true" ]
}

backup_tmux_config() {
    local conf="$HOME/.tmux.conf"
    if [ -f "$conf" ]; then
        local backup="$conf.ayayron-backup-$(date +%Y%m%d-%H%M%S)"
        cp "$conf" "$backup"
        print_success "Backed up .tmux.conf to $(basename "$backup")"
    fi
}

ensure_tpm() {
    if [ -d "$HOME/.tmux/plugins/tpm" ]; then
        print_success "tmux-tpm already installed"
        return 0
    fi

    if ! command_exists git; then
        print_error "git not found. Enable Git in Core Tools first."
        return 1
    fi

    print_info "Installing tmux-tpm..."
    git clone https://github.com/tmux-plugins/tpm "$HOME/.tmux/plugins/tpm" >/dev/null 2>&1
    print_success "tmux-tpm installed"
}

write_tmux_managed_config() {
    local conf="$HOME/.tmux.conf"
    local tmp
    tmp="$(mktemp)"
    local use_general="$1"
    local use_vim="$2"
    local use_dracula="$3"
    local use_catppuccin="$4"

    touch "$conf"
    awk '
        /# >>> ayayron tmux/ { skip = 1; next }
        /# <<< ayayron tmux/ { skip = 0; next }
        skip != 1 { print }
    ' "$conf" > "$tmp"

    cat >> "$tmp" <<'EOF'

# >>> ayayron tmux
# Managed by Ayayron. Re-run Ayayron to update this block.
EOF

    if [ "$use_general" == "true" ]; then
        cat >> "$tmp" <<'EOF'
set -g mouse on
set -g history-limit 50000
set -g display-time 4000
set -g status-interval 5
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g default-terminal "tmux-256color"
set -as terminal-overrides ",xterm-256color:RGB"
bind r source-file ~/.tmux.conf \; display-message "tmux config reloaded"
EOF
        print_success "tmux-general configured"
    fi

    if [ "$use_vim" == "true" ]; then
        cat >> "$tmp" <<'EOF'
setw -g mode-keys vi
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5
EOF
        print_success "tmux-vim-keys configured"
    fi

    if [ "$use_dracula" == "true" ] || [ "$use_catppuccin" == "true" ]; then
        cat >> "$tmp" <<'EOF'
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
EOF
    fi

    if [ "$use_dracula" == "true" ]; then
        cat >> "$tmp" <<'EOF'
set -g @plugin 'dracula/tmux'
set -g @dracula-show-powerline true
set -g @dracula-show-left-icon session
set -g @dracula-show-battery false
set -g @dracula-refresh-rate 10
EOF
        print_success "tmux-dracula configured"
    fi

    if [ "$use_catppuccin" == "true" ]; then
        cat >> "$tmp" <<'EOF'
set -g @plugin 'catppuccin/tmux#v2.3.0'
set -g @catppuccin_flavor 'mocha'
set -g @catppuccin_window_status_style 'rounded'
EOF
        print_success "tmux-catppuccin configured"
    fi

    if [ "$use_dracula" == "true" ] || [ "$use_catppuccin" == "true" ]; then
        cat >> "$tmp" <<'EOF'
run '~/.tmux/plugins/tpm/tpm'
EOF
    fi

    cat >> "$tmp" <<'EOF'
# <<< ayayron tmux
EOF

    mv "$tmp" "$conf"
}

install_oh_my_tmux() {
    if [ "$(get_config_value 'UserLevel.TmuxConfig.tmux-oh-my-tmux')" != "true" ]; then
        print_gray "Skipped tmux-oh-my-tmux (disabled in config)"
        return
    fi

    if ! command_exists git; then
        print_error "git not found. Enable Git in Core Tools first."
        return 1
    fi

    backup_tmux_config
    if [ -d "$HOME/.tmux" ] && [ ! -L "$HOME/.tmux" ]; then
        local backup="$HOME/.tmux.ayayron-backup-$(date +%Y%m%d-%H%M%S)"
        mv "$HOME/.tmux" "$backup"
        print_success "Backed up .tmux directory to $(basename "$backup")"
    fi

    print_info "Installing tmux-oh-my-tmux..."
    git clone --single-branch https://github.com/gpakosz/.tmux.git "$HOME/.tmux" >/dev/null 2>&1
    ln -s -f "$HOME/.tmux/.tmux.conf" "$HOME/.tmux.conf"
    cp "$HOME/.tmux/.tmux.conf.local" "$HOME/.tmux.conf.local"
    print_success "tmux-oh-my-tmux installed"
}

configure_tmux() {
    if ! tmux_config_requested; then
        return
    fi

    print_section "tmux Configuration"

    if ! command_exists tmux; then
        print_info "tmux is required for selected tmux configuration"
        install_brew_package "tmux" "tmux" "true"
    fi

    if ! command_exists tmux; then
        print_error "tmux could not be installed"
        return 1
    fi

    if [ "$(get_config_value 'UserLevel.TmuxConfig.tmux-oh-my-tmux')" == "true" ]; then
        install_oh_my_tmux
        return
    fi

    local use_general
    local use_vim
    local use_dracula
    local use_catppuccin
    use_general="$(get_config_value 'UserLevel.TmuxConfig.tmux-general')"
    use_vim="$(get_config_value 'UserLevel.TmuxConfig.tmux-vim-keys')"
    use_dracula="$(get_config_value 'UserLevel.TmuxConfig.tmux-dracula')"
    use_catppuccin="$(get_config_value 'UserLevel.TmuxConfig.tmux-catppuccin')"

    if [ "$use_dracula" == "true" ] || [ "$use_catppuccin" == "true" ]; then
        ensure_tpm || return 1
    fi

    backup_tmux_config
    write_tmux_managed_config "$use_general" "$use_vim" "$use_dracula" "$use_catppuccin"

    if [ "$use_dracula" == "true" ] || [ "$use_catppuccin" == "true" ]; then
        "$HOME/.tmux/plugins/tpm/bin/install_plugins" >/dev/null 2>&1 || \
            print_warning "TPM plugin install did not complete; open tmux and press prefix + I"
    fi

    if command_exists tmux && tmux has-session 2>/dev/null; then
        tmux source-file "$HOME/.tmux.conf" >/dev/null 2>&1 || true
        print_success "tmux config reloaded"
    else
        print_info "Start tmux to load the new configuration"
    fi
}

# ============================================================================
# PARSE ARGUMENTS
# ============================================================================

print_usage() {
    cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║              📖 DEVELOPMENT ENVIRONMENT SETUP HELP             ║
╚════════════════════════════════════════════════════════════════╝

DESCRIPTION:
  Automated development environment setup for macOS using Homebrew
  package manager for CLI tools and Homebrew Casks for GUI applications.

USAGE:
  ./setup-dev-environment-macos.sh --user
  ./setup-dev-environment-macos.sh --apps
  ./setup-dev-environment-macos.sh --help

PARAMETERS:

  --user
      Install user-level CLI tools via Homebrew
      Includes: Git, Python, Node.js, Docker CLI, Kubernetes tools, etc.

  --apps
      Install GUI applications via Homebrew Casks
      Includes: VSCode, iTerm2, Docker Desktop, browsers, productivity apps

  --config <path>
      Use custom configuration file
      Default: setup-dev-environment-macos.config

  --force-install <tool1>,<tool2>,...
      Install ONLY specified tools, ignoring config file
      Useful for quick installation of specific tools

  --help
      Show this help message

EXAMPLES:

  # Install CLI tools (recommended first step)
  ./setup-dev-environment-macos.sh --user

  # Install GUI applications
  ./setup-dev-environment-macos.sh --apps

  # Install both CLI tools and apps
  ./setup-dev-environment-macos.sh --user && ./setup-dev-environment-macos.sh --apps

  # Install specific tool only
  ./setup-dev-environment-macos.sh --user --force-install git

  # Install multiple specific tools
  ./setup-dev-environment-macos.sh --user --force-install git,python,kubectl

  # Use custom config file
  ./setup-dev-environment-macos.sh --user --config /path/to/custom.config

CONFIGURATION:
  Edit setup-dev-environment-macos.config to select which tools to install.
  Set each tool to 'true' (install) or 'false' (skip).

RECOMMENDED WORKFLOW:
  1. Edit setup-dev-environment-macos.config
  2. Run: ./setup-dev-environment-macos.sh --user
  3. Run: ./setup-dev-environment-macos.sh --apps (optional)
  4. Restart terminal
  5. Verify installations with: git --version, python3 --version, etc.

NOTES:
  - Homebrew will be installed automatically if not present
  - Xcode Command Line Tools will be installed if needed
  - Some applications may require password for installation

MORE HELP:
  README: https://github.com/kartalbas/setup-dev-environment
  Issues: https://github.com/kartalbas/setup-dev-environment/issues

EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --user)
            TOOLS_USER=true
            shift
            ;;
        --apps)
            TOOLS_APPS=true
            shift
            ;;
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --force-install)
            IFS=',' read -ra FORCE_INSTALL <<< "$2"
            shift 2
            ;;
        --help)
            print_usage
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            ;;
    esac
done

# ============================================================================
# DETERMINE CONFIG FILE
# ============================================================================

if [ -z "$CONFIG_FILE" ]; then
    CONFIG_FILE="$SCRIPT_DIR/setup-dev-environment-macos.config"
fi

if [ ! -f "$CONFIG_FILE" ]; then
    print_header "⚠️  CONFIG FILE NOT FOUND"
    echo ""
    echo -e "${RED}Configuration file not found: $CONFIG_FILE${NC}"
    echo ""
    echo "Please create the configuration file or specify a different path:"
    echo "  $0 --user --config /path/to/config"
    echo ""
    exit 1
fi

echo -e "${CYAN}📋 Using configuration file: $CONFIG_FILE${NC}"

# ============================================================================
# PARSE CONFIG
# ============================================================================

print_info "Parsing configuration file..."
parse_config "$CONFIG_FILE"
print_success "Configuration loaded"

MINIMAL_INSTALL=$(get_config_value "General.MinimalInstall")
INSTALL_HOMEBREW=$(get_config_value "General.InstallHomebrew")

echo -e "${GRAY}  Minimal Mode: $MINIMAL_INSTALL${NC}"

if [ ${#FORCE_INSTALL[@]} -gt 0 ]; then
    echo -e "${YELLOW}  Force Install: ${FORCE_INSTALL[*]}${NC}"
fi

# ============================================================================
# VALIDATE PARAMETERS
# ============================================================================

if [ "$TOOLS_USER" == false ] && [ "$TOOLS_APPS" == false ]; then
    print_header "⚠️  MISSING PARAMETER"
    echo ""
    echo "Please specify installation mode:"
    echo ""
    echo "  --user     Install user-level tools (CLI tools, languages, etc.)"
    echo "  --apps     Install GUI applications (Homebrew Casks)"
    echo ""
    echo "Examples:"
    echo "  $0 --user"
    echo "  $0 --apps"
    echo "  $0 --user --force-install git,curl"
    echo ""
    exit 1
fi

# ============================================================================
# BANNER
# ============================================================================

MODE="USER-LEVEL TOOLS"
[ "$TOOLS_APPS" == true ] && MODE="GUI APPLICATIONS"

print_header "🚀 macOS DEVELOPMENT ENVIRONMENT INSTALLER"
echo ""
echo -e "${CYAN}     Mode: $MODE${NC}"
echo -e "${CYAN}     Config: $CONFIG_FILE${NC}"
echo ""

sleep 2

# ============================================================================
# SYSTEM REQUIREMENTS
# ============================================================================

if [ "$TOOLS_USER" == true ]; then
    print_section "🔧 System Requirements"

    # Xcode CLI Tools
    if [ "$(get_config_value 'SystemRequirements.xcode-cli-tools')" == "true" ]; then
        install_xcode_cli_tools
    fi

    # Homebrew
    if [ "$INSTALL_HOMEBREW" == "true" ]; then
        install_homebrew
    fi
fi

# ============================================================================
# USER-LEVEL TOOLS
# ============================================================================

if [ "$TOOLS_USER" == true ]; then

    print_section "🔧 Core Development Tools"

    install_brew_package "git" "Git" "$(get_config_value 'UserLevel.CoreTools.git')"
    install_brew_package "gh" "GitHub CLI" "$(get_config_value 'UserLevel.CoreTools.gh')"
    install_brew_package "curl" "curl" "$(get_config_value 'UserLevel.CoreTools.curl')"
    install_brew_package "wget" "wget" "$(get_config_value 'UserLevel.CoreTools.wget')"
    install_brew_package "jq" "jq" "$(get_config_value 'UserLevel.CoreTools.jq')"
    install_brew_package "yq" "yq" "$(get_config_value 'UserLevel.CoreTools.yq')"
    install_brew_package "ripgrep" "ripgrep" "$(get_config_value 'UserLevel.CoreTools.ripgrep')"
    install_brew_package "fd" "fd" "$(get_config_value 'UserLevel.CoreTools.fd')"
    install_brew_package "fzf" "fzf" "$(get_config_value 'UserLevel.CoreTools.fzf')"
    install_brew_package "bat" "bat" "$(get_config_value 'UserLevel.CoreTools.bat')"
    install_brew_package "tree" "tree" "$(get_config_value 'UserLevel.CoreTools.tree')"
    install_brew_package "htop" "htop" "$(get_config_value 'UserLevel.CoreTools.htop')"

    # ========================================================================
    # PROGRAMMING LANGUAGES
    # ========================================================================

    print_section "💻 Programming Languages"

    # Python
    if [ "$(get_config_value 'UserLevel.Languages.Python.install')" == "true" ]; then
        echo -e "\n${YELLOW}📍 Python${NC}"
        install_brew_package "python@3" "Python3" "true"

        if [ "$(get_config_value 'UserLevel.Languages.Python.pip-packages')" == "true" ] && command_exists pip3; then
            print_info "Installing Python packages..."
            pip3 install --user --quiet pylint black flake8 mypy pytest ipython >/dev/null 2>&1
            print_success "Python packages installed"
        fi
    fi

    # Node.js via NVM
    if [ "$(get_config_value 'UserLevel.Languages.NodeJS.nvm')" == "true" ]; then
        echo -e "\n${YELLOW}📍 Node.js (via NVM)${NC}"
        install_nvm "true"

        # Load NVM if just installed
        export NVM_DIR="$HOME/.nvm"
        # shellcheck disable=SC1091
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        # Install Yarn
        install_yarn "$(get_config_value 'UserLevel.Languages.NodeJS.yarn')"

        # Install pnpm
        install_pnpm "$(get_config_value 'UserLevel.Languages.NodeJS.pnpm')"

        # Install global npm packages
        if [ "$(get_config_value 'UserLevel.Languages.NodeJS.npm-global-packages')" == "true" ] && command_exists npm; then
            print_info "Installing global npm packages..."
            npm install -g typescript ts-node eslint prettier >/dev/null 2>&1
            if [ $? -eq 0 ]; then
                print_success "npm packages installed"
            else
                print_warning "Some npm packages may have failed"
            fi
        fi
    fi

    # Go
    if [ "$(get_config_value 'UserLevel.Languages.Go.install')" == "true" ]; then
        echo -e "\n${YELLOW}📍 Go${NC}"
        install_brew_package "go" "Go" "true"
    fi

    # Rust
    if [ "$(get_config_value 'UserLevel.Languages.Rust.install')" == "true" ]; then
        echo -e "\n${YELLOW}📍 Rust${NC}"
        if command_exists rustc; then
            print_success "Rust already installed"
        else
            print_info "Installing Rust via rustup..."
            curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y >/dev/null 2>&1
            # shellcheck disable=SC1091
            source "$HOME/.cargo/env"
            print_success "Rust installed"
            print_warning "Restart terminal or run: source ~/.cargo/env"
        fi
    fi

    # Java
    if [ "$(get_config_value 'UserLevel.Languages.Java.install')" == "true" ]; then
        echo -e "\n${YELLOW}📍 Java${NC}"
        install_brew_package "openjdk" "OpenJDK" "true"
        install_brew_package "maven" "Maven" "$(get_config_value 'UserLevel.Languages.Java.maven')"
        install_brew_package "gradle" "Gradle" "$(get_config_value 'UserLevel.Languages.Java.gradle')"
    fi

    # ========================================================================
    # TERMINAL ENHANCEMENTS
    # ========================================================================

    print_section "🎨 Terminal Enhancements"

    # Starship
    if [ "$(get_config_value 'UserLevel.Terminal.starship')" == "true" ]; then
        install_brew_package "starship" "Starship" "true"
    fi

    # Zoxide
    if [ "$(get_config_value 'UserLevel.Terminal.zoxide')" == "true" ]; then
        install_brew_package "zoxide" "Zoxide" "true"
    fi

    install_brew_package "tmux" "tmux" "$(get_config_value 'UserLevel.Terminal.tmux')"
    install_brew_cask "kitty" "Kitty" "$(get_config_value 'UserLevel.Terminal.kitty')"
    install_brew_cask "ghostty" "Ghostty" "$(get_config_value 'UserLevel.Terminal.ghostty')"
    install_brew_package "btop" "btop" "$(get_config_value 'UserLevel.Terminal.btop')"

    configure_tmux

    # ========================================================================
    # FONTS
    # ========================================================================

    print_section "🔤 Fonts"

    # Tap the fonts cask if needed
    if ! brew tap | grep -q "homebrew/cask-fonts"; then
        print_info "Tapping homebrew/cask-fonts..."
        brew tap homebrew/cask-fonts >/dev/null 2>&1
    fi

    install_brew_cask "font-fira-code-nerd-font" "Fira Code Nerd Font" "$(get_config_value 'UserLevel.Fonts.font-fira-code-nerd-font')"
    install_brew_cask "font-cascadia-code" "Cascadia Code" "$(get_config_value 'UserLevel.Fonts.font-cascadia-code')"
    install_brew_cask "font-jetbrains-mono-nerd-font" "JetBrains Mono Nerd Font" "$(get_config_value 'UserLevel.Fonts.font-jetbrains-mono-nerd-font')"
    install_brew_cask "font-hack-nerd-font" "Hack Nerd Font" "$(get_config_value 'UserLevel.Fonts.font-hack-nerd-font')"

    # ========================================================================
    # CONFIGURE SHELL PROFILE
    # ========================================================================

    print_section "⚙️ Shell Profile Configuration"

    SHELL_RC="$HOME/.zshrc"
    if [[ "$SHELL" == *"bash"* ]]; then
        SHELL_RC="$HOME/.bashrc"
    fi

    print_info "Configuring $SHELL_RC..."

    # Add NVM to shell profile if not already there
    if [ "$(get_config_value 'UserLevel.Languages.NodeJS.nvm')" == "true" ]; then
        if ! grep -q 'NVM_DIR' "$SHELL_RC" 2>/dev/null; then
            cat >> "$SHELL_RC" << 'EOF'

# NVM (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
            print_success "NVM added to $SHELL_RC"
        fi
    fi

    # Add Starship to shell profile
    if [ "$(get_config_value 'UserLevel.Terminal.starship')" == "true" ] && command_exists starship; then
        if ! grep -q 'starship init' "$SHELL_RC" 2>/dev/null; then
            if [[ "$SHELL" == *"zsh"* ]]; then
                echo 'eval "$(starship init zsh)"' >> "$SHELL_RC"
            else
                echo 'eval "$(starship init bash)"' >> "$SHELL_RC"
            fi
            print_success "Starship added to $SHELL_RC"
        fi
    fi

    # Add Zoxide to shell profile
    if [ "$(get_config_value 'UserLevel.Terminal.zoxide')" == "true" ] && command_exists zoxide; then
        if ! grep -q 'zoxide init' "$SHELL_RC" 2>/dev/null; then
            if [[ "$SHELL" == *"zsh"* ]]; then
                echo 'eval "$(zoxide init zsh)"' >> "$SHELL_RC"
            else
                echo 'eval "$(zoxide init bash)"' >> "$SHELL_RC"
            fi
            print_success "Zoxide added to $SHELL_RC"
        fi
    fi

    print_warning "Restart terminal or run: source $SHELL_RC"

    # ========================================================================
    # SUMMARY
    # ========================================================================

    print_section "✅ Installation Complete!"

    echo ""
    print_header "🎉 USER-LEVEL INSTALLATION COMPLETE!"
    echo ""
    echo -e "${CYAN}📍 Configuration File: $CONFIG_FILE${NC}"
    echo ""
    echo -e "${GREEN}✅ All selected tools have been installed!${NC}"
    echo ""
    echo -e "${YELLOW}📝 NEXT STEPS:${NC}"
    echo ""
    echo "1. Restart your terminal (or run: source $SHELL_RC)"
    echo ""
    echo "2. Verify installations:"
    echo "   git --version"
    echo "   python3 --version"
    echo "   node --version"
    echo "   go version"
    echo ""
    echo "3. Configure Git:"
    echo "   git config --global user.name \"Your Name\""
    echo "   git config --global user.email \"your@email.com\""
    echo ""
    echo -e "${CYAN}Happy Coding! 🚀${NC}"
    echo ""
fi

# ============================================================================
# GUI APPLICATIONS
# ============================================================================

if [ "$TOOLS_APPS" == true ]; then
    print_section "📦 GUI Applications (Homebrew Casks)"

    print_section "Development Applications"
    install_brew_cask "visual-studio-code" "Visual Studio Code" "$(get_config_value 'Applications.Development.visual-studio-code')"
    install_brew_cask "iterm2" "iTerm2" "$(get_config_value 'Applications.Development.iterm2')"
    install_brew_cask "docker" "Docker Desktop" "$(get_config_value 'Applications.Development.docker')"

    print_section "Browsers"
    install_brew_cask "google-chrome" "Google Chrome" "$(get_config_value 'Applications.Browsers.google-chrome')"
    install_brew_cask "firefox" "Firefox" "$(get_config_value 'Applications.Browsers.firefox')"
    install_brew_cask "brave-browser" "Brave Browser" "$(get_config_value 'Applications.Browsers.brave-browser')"
    install_brew_cask "arc" "Arc" "$(get_config_value 'Applications.Browsers.arc')"

    print_section "Productivity Applications"
    install_brew_cask "rectangle" "Rectangle" "$(get_config_value 'Applications.Productivity.rectangle')"
    install_brew_cask "raycast" "Raycast" "$(get_config_value 'Applications.Productivity.raycast')"
    install_brew_cask "alfred" "Alfred" "$(get_config_value 'Applications.Productivity.alfred')"
    install_brew_cask "notion" "Notion" "$(get_config_value 'Applications.Productivity.notion')"
    install_brew_cask "obsidian" "Obsidian" "$(get_config_value 'Applications.Productivity.obsidian')"
    install_brew_cask "localsend" "LocalSend" "$(get_config_value 'Applications.Productivity.localsend')"
    install_brew_cask "copyq" "CopyQ" "$(get_config_value 'Applications.Productivity.copyq')"
    if [ "$(get_config_value 'Applications.Productivity.autokey')" == "true" ]; then
        print_warning "AutoKey is Linux-only; skipping on macOS"
    else
        print_gray "Skipped AutoKey (disabled in config)"
    fi

    print_section "Communication"
    install_brew_cask "slack" "Slack" "$(get_config_value 'Applications.Communication.slack')"
    install_brew_cask "discord" "Discord" "$(get_config_value 'Applications.Communication.discord')"
    install_brew_cask "zoom" "Zoom" "$(get_config_value 'Applications.Communication.zoom')"
    install_brew_cask "whatsapp" "WhatsApp" "$(get_config_value 'Applications.Communication.whatsapp')"
    install_brew_cask "anydesk" "AnyDesk" "$(get_config_value 'Applications.Communication.anydesk')"

    print_section "Utilities"
    install_brew_cask "the-unarchiver" "The Unarchiver" "$(get_config_value 'Applications.Utilities.the-unarchiver')"
    install_brew_cask "appcleaner" "AppCleaner" "$(get_config_value 'Applications.Utilities.appcleaner')"
    install_brew_cask "stats" "Stats" "$(get_config_value 'Applications.Utilities.stats')"
    install_brew_cask "keepingyouawake" "KeepingYouAwake" "$(get_config_value 'Applications.Utilities.keepingyouawake')"

    print_section "Media"
    install_brew_cask "vlc" "VLC" "$(get_config_value 'Applications.Media.vlc')"
    install_brew_cask "spotify" "Spotify" "$(get_config_value 'Applications.Media.spotify')"
    install_brew_cask "moonlight" "Moonlight" "$(get_config_value 'Applications.Media.moonlight')"
    install_brew_cask "obs" "OBS Studio" "$(get_config_value 'Applications.Media.obs')"

    print_section "✅ Applications Installation Complete!"
    echo ""
    print_success "All selected applications have been installed!"
    echo ""
fi
