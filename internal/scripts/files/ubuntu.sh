#!/usr/bin/env bash
# setup-dev-environment.sh
# Dynamic development environment setup for Ubuntu/Debian with configuration file
# Config file: setup-dev-environment-ubuntu.config
# Version: 1.0.0
#
# Changelog:
# v1.0.0 - Initial Ubuntu/Debian setup script
#          Official NVM for Node.js LTS installation
#          Yarn via Corepack, pnpm via official installer
#          Support for user-level and admin-level tools

set -e

# ============================================================================
# VARIABLES
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE=""
TOOLS_USER=false
TOOLS_ADMIN=false
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

is_sudo() {
    [ "$EUID" -eq 0 ]
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

            if [[ "$full_section" == "General" ]]; then
                section="General"
                subsection=""
            elif [[ "$full_section" =~ ^(UserLevel|AdminLevel)\.(.+)$ ]]; then
                section="${BASH_REMATCH[1]}"
                subsection="${BASH_REMATCH[2]}"
            elif [[ "$full_section" =~ ^(UserLevel|AdminLevel)$ ]]; then
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

            # Remove trailing comments and whitespace
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
# INSTALLATION FUNCTIONS
# ============================================================================

install_apt_package() {
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

    if dpkg -l | grep -q "^ii  $package "; then
        print_success "$display_name already installed"
    else
        print_info "Installing $display_name..."
        sudo apt-get install -y "$package" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            print_success "$display_name installed"
        else
            print_error "Failed to install $display_name"
        fi
    fi
}

install_snap_package() {
    local package="$1"
    local display_name="${2:-$package}"
    local classic="${3:-false}"
    local should_install="${4:-true}"

    [ "$should_install" != "true" ] && print_gray "Skipped $display_name (disabled in config)" && return

    if ! command_exists snap; then
        print_warning "snapd not installed, skipping $display_name"
        return
    fi

    if snap list "$package" >/dev/null 2>&1; then
        print_success "$display_name already installed"
    else
        print_info "Installing $display_name via snap..."
        if [ "$classic" == "true" ]; then
            sudo snap install "$package" --classic >/dev/null 2>&1
        else
            sudo snap install "$package" >/dev/null 2>&1
        fi

        if [ $? -eq 0 ]; then
            print_success "$display_name installed"
        else
            print_error "Failed to install $display_name"
        fi
    fi
}

install_brave_browser() {
    local should_install="$1"

    [ "$should_install" != "true" ] && print_gray "Skipped Brave Browser (disabled in config)" && return

    if command_exists brave-browser; then
        print_success "Brave Browser already installed"
        return
    fi

    print_info "Installing Brave Browser from official APT repository..."
    sudo apt-get install -y curl >/dev/null 2>&1
    sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg \
        https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
    sudo curl -fsSLo /etc/apt/sources.list.d/brave-browser-release.sources \
        https://brave-browser-apt-release.s3.brave.com/brave-browser.sources
    sudo apt-get update >/dev/null 2>&1
    sudo apt-get install -y brave-browser >/dev/null 2>&1

    if command_exists brave-browser; then
        print_success "Brave Browser installed"
    else
        print_error "Failed to install Brave Browser"
    fi
}

install_anydesk() {
    local should_install="$1"

    [ "$should_install" != "true" ] && print_gray "Skipped AnyDesk (disabled in config)" && return

    if command_exists anydesk || dpkg -l anydesk 2>/dev/null | grep -q "^ii"; then
        print_success "AnyDesk already installed"
        return
    fi

    print_info "Installing AnyDesk from official APT repository..."
    sudo apt-get install -y ca-certificates curl gpg >/dev/null 2>&1
    curl -fsSL https://keys.anydesk.com/repos/DEB-GPG-KEY | \
        sudo gpg --dearmor --yes -o /usr/share/keyrings/anydesk.gpg
    printf '%s\n' \
        'Types: deb' \
        'URIs: https://deb.anydesk.com' \
        'Suites: all' \
        'Components: main' \
        'Signed-By: /usr/share/keyrings/anydesk.gpg' | \
        sudo tee /etc/apt/sources.list.d/anydesk.sources >/dev/null
    sudo apt-get update >/dev/null 2>&1
    sudo apt-get install -y anydesk >/dev/null 2>&1

    if dpkg -l anydesk 2>/dev/null | grep -q "^ii"; then
        print_success "AnyDesk installed"
    else
        print_error "Failed to install AnyDesk"
    fi
}

install_obs_virtual_camera() {
    local should_install="$1"

    [ "$should_install" != "true" ] && print_gray "Skipped OBS virtual camera drivers (disabled in config)" && return

    print_info "Installing OBS virtual camera drivers..."
    sudo apt-get install -y "linux-headers-$(uname -r)" v4l2loopback-dkms v4l2loopback-utils >/dev/null 2>&1
    if dpkg -l v4l2loopback-dkms 2>/dev/null | grep -q "^ii"; then
        print_success "OBS virtual camera drivers installed"
        print_warning "If virtual camera is not visible, reboot or run: sudo modprobe v4l2loopback"
    else
        print_error "Failed to install OBS virtual camera drivers"
    fi
}

install_nerd_font() {
    local font_name="$1"
    local archive_name="$2"
    local should_install="$3"
    local font_dir="$HOME/.local/share/fonts/NerdFonts/$font_name"
    local tmp_zip

    [ "$should_install" != "true" ] && print_gray "Skipped $font_name Nerd Font (disabled in config)" && return

    if [ -d "$font_dir" ] && find "$font_dir" -type f \( -name '*.ttf' -o -name '*.otf' \) | grep -q .; then
        print_success "$font_name Nerd Font already installed"
        return
    fi

    if ! command_exists unzip; then
        install_apt_package "unzip" "unzip" "true"
    fi

    print_info "Installing $font_name Nerd Font..."
    mkdir -p "$font_dir"
    tmp_zip="$(mktemp)"
    curl -fsSL "https://github.com/ryanoasis/nerd-fonts/releases/latest/download/${archive_name}.zip" -o "$tmp_zip"
    unzip -o -q "$tmp_zip" -d "$font_dir"
    rm -f "$tmp_zip"
    fc-cache -f "$HOME/.local/share/fonts" >/dev/null 2>&1 || true
    print_success "$font_name Nerd Font installed"
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
            print_warning "Restart terminal or run: source ~/.bashrc (or ~/.zshrc)"
        else
            print_warning "Node.js installed but not in PATH yet"
            print_warning "Run: source ~/.bashrc && nvm use --lts"
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
        print_warning "Restart terminal or run: source ~/.bashrc (or ~/.zshrc)"
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
        install_apt_package "tmux" "tmux" "true"
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

backup_illogical_impulse_configs() {
    local backup_root="$HOME/.local/share/ayayron/backups/illogical-impulse-$(date +%Y%m%d-%H%M%S)"
    local backed_up=false
    local targets=(
        "$HOME/.config/hypr"
        "$HOME/.config/quickshell"
        "$HOME/.config/ags"
        "$HOME/.config/illogical-impulse"
        "$HOME/.config/fuzzel"
        "$HOME/.config/kitty"
        "$HOME/.config/foot"
        "$HOME/.config/rofi"
        "$HOME/.config/waybar"
        "$HOME/.config/wlogout"
        "$HOME/.local/share/illogical-impulse"
        "$HOME/.local/state/quickshell"
    )

    for target in "${targets[@]}"; do
        if [ -e "$target" ]; then
            local rel="${target#$HOME/}"
            local dest="$backup_root/$rel"
            mkdir -p "$(dirname "$dest")"
            cp -a "$target" "$dest"
            backed_up=true
            print_success "Backed up $rel"
        fi
    done

    if [ "$backed_up" == true ]; then
        print_warning "Backups saved to $backup_root"
    else
        print_gray "No existing Illogical Impulse config paths found to back up"
    fi
}

install_illogical_impulse() {
    local should_install="$1"

    [ "$should_install" != "true" ] && print_gray "Skipped illogical-impulse (disabled in config)" && return

    if [ -d "$HOME/.config/quickshell/ii" ] || [ -d "$HOME/.cache/dots-hyprland" ]; then
        print_success "illogical-impulse already appears to be installed"
        return
    fi

    if ! command_exists curl; then
        print_error "curl not found. Enable curl in Core Tools first."
        return 1
    fi

    print_warning "Illogical Impulse is an interactive upstream dotfiles installer."
    print_warning "Existing matching config folders will be backed up before it runs."
    backup_illogical_impulse_configs

    print_info "Installing illogical-impulse from https://ii.clsty.link/get ..."
    print_info "Initial prompts are answered to run without per-command confirmation."

    if (printf '\n\nn\n'; yes e) | bash <(curl -fsSL https://ii.clsty.link/get); then
        print_success "illogical-impulse installed"
    else
        print_error "Failed to install illogical-impulse"
        return 1
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
  Automated development environment setup for Ubuntu/Debian using apt,
  snap, and direct installers for various development tools.

USAGE:
  ./setup-dev-environment-ubuntu.sh --user
  ./setup-dev-environment-ubuntu.sh --admin
  ./setup-dev-environment-ubuntu.sh --help

PARAMETERS:

  --user
      Install user-level tools (NO SUDO required)
      Includes: Git, Python, Node.js, Docker CLI, Kubernetes tools, etc.

  --admin
      Install admin-level tools (REQUIRES SUDO)
      Includes: System packages, Docker Engine, databases, GUI applications

  --config <path>
      Use custom configuration file
      Default: setup-dev-environment-ubuntu.config

  --force-install <tool1>,<tool2>,...
      Install ONLY specified tools, ignoring config file
      Useful for quick installation of specific tools

  --help
      Show this help message

EXAMPLES:

  # Install user-level tools (recommended first step)
  ./setup-dev-environment-ubuntu.sh --user

  # Install admin-level tools (run with sudo)
  sudo ./setup-dev-environment-ubuntu.sh --admin

  # Install specific tool only
  ./setup-dev-environment-ubuntu.sh --user --force-install git

  # Install multiple specific tools
  ./setup-dev-environment-ubuntu.sh --user --force-install git,python,kubectl

  # Use custom config file
  ./setup-dev-environment-ubuntu.sh --user --config /path/to/custom.config

CONFIGURATION:
  Edit setup-dev-environment-ubuntu.config to select which tools to install.
  Set each tool to 'true' (install) or 'false' (skip).

RECOMMENDED WORKFLOW:
  1. Edit setup-dev-environment-ubuntu.config
  2. Run: ./setup-dev-environment-ubuntu.sh --user
  3. Restart terminal
  4. (Optional) Run: sudo ./setup-dev-environment-ubuntu.sh --admin
  5. Verify installations with: git --version, python3 --version, etc.

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
        --admin)
            TOOLS_ADMIN=true
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
    CONFIG_FILE="$SCRIPT_DIR/setup-dev-environment-ubuntu.config"
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
UPDATE_PACKAGES=$(get_config_value "General.UpdatePackages")

echo -e "${GRAY}  Minimal Mode: $MINIMAL_INSTALL${NC}"
echo -e "${GRAY}  Update Packages: $UPDATE_PACKAGES${NC}"

if [ ${#FORCE_INSTALL[@]} -gt 0 ]; then
    echo -e "${YELLOW}  Force Install: ${FORCE_INSTALL[*]}${NC}"
fi

# ============================================================================
# VALIDATE PARAMETERS
# ============================================================================

if [ "$TOOLS_USER" == false ] && [ "$TOOLS_ADMIN" == false ]; then
    print_header "⚠️  MISSING PARAMETER"
    echo ""
    echo "Please specify installation mode:"
    echo ""
    echo "  --user     Install user-level tools (NO SUDO)"
    echo "  --admin    Install admin-level tools (REQUIRES SUDO)"
    echo ""
    echo "Examples:"
    echo "  $0 --user"
    echo "  $0 --admin"
    echo "  $0 --user --force-install git,curl"
    echo ""
    exit 1
fi

# ============================================================================
# CHECK SUDO FOR ADMIN TOOLS
# ============================================================================

if [ "$TOOLS_ADMIN" == true ] && ! is_sudo; then
    print_header "⚠️  ERROR"
    echo ""
    echo -e "${RED}Admin-level tools require sudo privileges.${NC}"
    echo ""
    echo "Please run with sudo:"
    echo "  sudo $0 --admin"
    echo ""
    exit 1
fi

# ============================================================================
# BANNER
# ============================================================================

MODE="USER-LEVEL (No Sudo)"
[ "$TOOLS_ADMIN" == true ] && MODE="ADMIN-LEVEL (Requires Sudo)"

print_header "🚀 UBUNTU DEVELOPMENT ENVIRONMENT INSTALLER"
echo ""
echo -e "${CYAN}     Mode: $MODE${NC}"
echo -e "${CYAN}     Config: $CONFIG_FILE${NC}"
echo ""

sleep 2

# ============================================================================
# USER-LEVEL TOOLS
# ============================================================================

if [ "$TOOLS_USER" == true ]; then

    print_section "📦 Updating Package Lists"

    if [ "$UPDATE_PACKAGES" == "true" ]; then
        print_info "Running apt update..."
        sudo apt-get update >/dev/null 2>&1
        print_success "Package lists updated"
    else
        print_gray "Skipped (disabled in config)"
    fi

    # ========================================================================
    # CORE TOOLS
    # ========================================================================

    print_section "🔧 Core Development Tools"

    install_apt_package "git" "Git" "$(get_config_value 'UserLevel.CoreTools.git')"
    install_apt_package "curl" "curl" "$(get_config_value 'UserLevel.CoreTools.curl')"
    install_apt_package "wget" "wget" "$(get_config_value 'UserLevel.CoreTools.wget')"
    install_apt_package "jq" "jq" "$(get_config_value 'UserLevel.CoreTools.jq')"
    install_apt_package "ripgrep" "ripgrep" "$(get_config_value 'UserLevel.CoreTools.ripgrep')"
    install_apt_package "fd-find" "fd-find" "$(get_config_value 'UserLevel.CoreTools.fd-find')"
    install_apt_package "fzf" "fzf" "$(get_config_value 'UserLevel.CoreTools.fzf')"
    install_apt_package "bat" "bat" "$(get_config_value 'UserLevel.CoreTools.bat')"
    install_apt_package "tree" "tree" "$(get_config_value 'UserLevel.CoreTools.tree')"
    install_apt_package "htop" "htop" "$(get_config_value 'UserLevel.CoreTools.htop')"

    # ========================================================================
    # BUILD ESSENTIALS
    # ========================================================================

    print_section "🔨 Build Essentials"

    install_apt_package "build-essential" "build-essential" "$(get_config_value 'UserLevel.BuildEssentials.build-essential')"
    install_apt_package "pkg-config" "pkg-config" "$(get_config_value 'UserLevel.BuildEssentials.pkg-config')"
    install_apt_package "cmake" "cmake" "$(get_config_value 'UserLevel.BuildEssentials.cmake')"

    # ========================================================================
    # PROGRAMMING LANGUAGES
    # ========================================================================

    print_section "💻 Programming Languages"

    # Python
    if [ "$(get_config_value 'UserLevel.Languages.Python.install')" == "true" ]; then
        echo -e "\n${YELLOW}📍 Python${NC}"
        install_apt_package "python3" "Python3" "true"
        install_apt_package "python3-pip" "pip" "true"

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
        install_snap_package "go" "Go" "true" "true"
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
        install_apt_package "default-jdk" "OpenJDK" "true"
        install_apt_package "maven" "Maven" "$(get_config_value 'UserLevel.Languages.Java.maven')"
        install_apt_package "gradle" "Gradle" "$(get_config_value 'UserLevel.Languages.Java.gradle')"
    fi

    # ========================================================================
    # EDITORS
    # ========================================================================

    print_section "✏️ Editors"

    install_apt_package "neovim" "Neovim" "$(get_config_value 'UserLevel.Editors.neovim')"
    install_apt_package "vim" "Vim" "$(get_config_value 'UserLevel.Editors.vim')"
    install_apt_package "nano" "Nano" "$(get_config_value 'UserLevel.Editors.nano')"

    # ========================================================================
    # TERMINAL ENHANCEMENTS
    # ========================================================================

    print_section "🎨 Terminal Enhancements"

    # Starship
    if [ "$(get_config_value 'UserLevel.Terminal.starship')" == "true" ]; then
        if command_exists starship; then
            print_success "Starship already installed"
        else
            print_info "Installing Starship..."
            curl -sS https://starship.rs/install.sh | sh -s -- -y >/dev/null 2>&1
            print_success "Starship installed"
        fi
    fi

    # Zoxide
    if [ "$(get_config_value 'UserLevel.Terminal.zoxide')" == "true" ]; then
        if command_exists zoxide; then
            print_success "Zoxide already installed"
        else
            print_info "Installing Zoxide..."
            curl -sS https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | bash >/dev/null 2>&1
            print_success "Zoxide installed"
        fi
    fi

    install_apt_package "tmux" "tmux" "$(get_config_value 'UserLevel.Terminal.tmux')"
    install_apt_package "kitty" "Kitty" "$(get_config_value 'UserLevel.Terminal.kitty')"
    install_snap_package "ghostty" "Ghostty" "true" "$(get_config_value 'UserLevel.Terminal.ghostty')"
    install_apt_package "btop" "btop" "$(get_config_value 'UserLevel.Terminal.btop')"

    configure_tmux

    # ========================================================================
    # DOTFILES
    # ========================================================================

    print_section "Dotfiles"

    install_illogical_impulse "$(get_config_value 'UserLevel.Dotfiles.illogical-impulse')"

    # ========================================================================
    # DESKTOP APPS
    # ========================================================================

    print_section "Desktop Apps"

    install_snap_package "localsend" "LocalSend" "false" "$(get_config_value 'UserLevel.DesktopApps.localsend')"
    install_apt_package "autokey-gtk" "AutoKey" "$(get_config_value 'UserLevel.DesktopApps.autokey')"
    install_brave_browser "$(get_config_value 'UserLevel.DesktopApps.brave-browser')"
    install_apt_package "copyq" "CopyQ" "$(get_config_value 'UserLevel.DesktopApps.copyq')"
    install_anydesk "$(get_config_value 'UserLevel.DesktopApps.anydesk')"
    install_snap_package "moonlight" "Moonlight" "false" "$(get_config_value 'UserLevel.DesktopApps.moonlight')"
    install_snap_package "obsidian" "Obsidian" "true" "$(get_config_value 'UserLevel.DesktopApps.obsidian')"
    install_apt_package "obs-studio" "OBS Studio" "$(get_config_value 'UserLevel.DesktopApps.obs-studio')"
    install_obs_virtual_camera "$(get_config_value 'UserLevel.DesktopApps.obs-virtual-camera')"
    install_snap_package "unofficial-whatsapp" "WhatsApp Web Desktop" "false" "$(get_config_value 'UserLevel.DesktopApps.whatsapp-web')"

    # ========================================================================
    # FONTS
    # ========================================================================

    print_section "Fonts"

    if [ "$(get_config_value 'UserLevel.Fonts.nerd-fonts')" == "true" ]; then
        install_nerd_font "FiraCode" "FiraCode" "true"
        install_nerd_font "JetBrainsMono" "JetBrainsMono" "true"
    fi
    install_nerd_font "FiraCode" "FiraCode" "$(get_config_value 'UserLevel.Fonts.font-fira-code-nerd-font')"
    install_nerd_font "CascadiaCode" "CascadiaCode" "$(get_config_value 'UserLevel.Fonts.font-cascadia-code-nerd-font')"
    install_nerd_font "JetBrainsMono" "JetBrainsMono" "$(get_config_value 'UserLevel.Fonts.font-jetbrains-mono-nerd-font')"
    install_nerd_font "Hack" "Hack" "$(get_config_value 'UserLevel.Fonts.font-hack-nerd-font')"

    # ========================================================================
    # CONFIGURE SHELL PROFILE
    # ========================================================================

    print_section "⚙️ Shell Profile Configuration"

    SHELL_RC="$HOME/.bashrc"
    if [ -n "$ZSH_VERSION" ]; then
        SHELL_RC="$HOME/.zshrc"
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
            echo 'eval "$(starship init bash)"' >> "$SHELL_RC"
            print_success "Starship added to $SHELL_RC"
        fi
    fi

    # Add Zoxide to shell profile
    if [ "$(get_config_value 'UserLevel.Terminal.zoxide')" == "true" ] && command_exists zoxide; then
        if ! grep -q 'zoxide init' "$SHELL_RC" 2>/dev/null; then
            echo 'eval "$(zoxide init bash)"' >> "$SHELL_RC"
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
# ADMIN-LEVEL TOOLS
# ============================================================================

if [ "$TOOLS_ADMIN" == true ]; then
    print_section "🔐 Admin-Level Tools"

    print_info "Admin tools installation not yet implemented"
    print_info "This section will install system-level packages like:"
    print_info "  - Docker Engine"
    print_info "  - PostgreSQL, MySQL, MongoDB"
    print_info "  - System utilities"
    echo ""

    print_success "Admin installation complete (placeholder)"
fi
