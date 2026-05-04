#!/usr/bin/env bash
# Setup script for Ayayron — installs all build dependencies.
# Usage: bash setup.sh
set -euo pipefail

OS="$(uname -s)"
ARCH="$(uname -m)"
GO_VERSION="1.22.5"

step()  { echo -e "\n\033[1;36m→ $*\033[0m"; }
ok()    { echo -e "\033[1;32m✓ $*\033[0m"; }
warn()  { echo -e "\033[1;33m! $*\033[0m"; }
die()   { echo -e "\033[1;31m✗ $*\033[0m"; exit 1; }

ensure_go() {
    if command -v go &>/dev/null; then
        MAJOR=$(go version | grep -oP 'go\K[0-9]+')
        MINOR=$(go version | grep -oP 'go[0-9]+\.\K[0-9]+')
        if [ "${MAJOR:-0}" -ge 1 ] && [ "${MINOR:-0}" -ge 21 ]; then
            ok "Go $(go version | awk '{print $3}') already installed"; return
        fi
        warn "Go version too old — upgrading"
    fi

    step "Installing Go $GO_VERSION"
    case "$OS" in
        Darwin) brew install go ;;
        Linux)
            case "$ARCH" in
                x86_64)  GOARCH="amd64" ;;
                aarch64) GOARCH="arm64" ;;
                *)       die "Unsupported architecture: $ARCH" ;;
            esac
            TARBALL="go${GO_VERSION}.linux-${GOARCH}.tar.gz"
            curl -fsSL "https://go.dev/dl/${TARBALL}" -o "/tmp/${TARBALL}"
            sudo rm -rf /usr/local/go
            sudo tar -C /usr/local -xzf "/tmp/${TARBALL}"
            rm "/tmp/${TARBALL}"
            export PATH="$PATH:/usr/local/go/bin"
            # Persist for future shells
            PROFILE="${HOME}/.profile"
            grep -q '/usr/local/go/bin' "$PROFILE" 2>/dev/null || \
                echo 'export PATH="$PATH:/usr/local/go/bin"' >> "$PROFILE"
            ok "Go $GO_VERSION installed to /usr/local/go"
            ;;
    esac
}

ensure_node() {
    if command -v node &>/dev/null; then
        MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
        if [ "${MAJOR:-0}" -ge 18 ]; then
            ok "Node.js $(node --version) already installed"; return
        fi
        warn "Node.js version too old — upgrading"
    fi

    step "Installing Node.js 20 LTS"
    case "$OS" in
        Darwin) brew install node ;;
        Linux)
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
    esac
    ok "Node.js $(node --version) installed"
}

ensure_linux_deps() {
    step "Installing Linux system dependencies"
    sudo apt-get update -qq
    sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev

    SRC="/usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.1.pc"
    DST="/usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.0.pc"
    if [ -f "$SRC" ] && [ ! -e "$DST" ]; then
        sudo ln -s "$SRC" "$DST"
        ok "Created webkit2gtk-4.0 symlink"
    else
        ok "webkit2gtk symlink already present"
    fi
}

ensure_wails() {
    # Make sure GOPATH/bin is on PATH
    export PATH="$PATH:$(go env GOPATH 2>/dev/null)/bin:/usr/local/go/bin"

    if command -v wails &>/dev/null; then
        ok "Wails $(wails version 2>/dev/null | head -1) already installed"; return
    fi

    step "Installing Wails CLI"
    go install github.com/wailsapp/wails/v2/cmd/wails@latest

    GOPATH_BIN="$(go env GOPATH)/bin"
    PROFILE="${HOME}/.profile"
    grep -q "$GOPATH_BIN" "$PROFILE" 2>/dev/null || \
        echo "export PATH=\"\$PATH:$GOPATH_BIN\"" >> "$PROFILE"
    ok "Wails CLI installed"
}

main() {
    echo -e "\033[1;35m=== Ayayron — Build Setup ===\033[0m"

    case "$OS" in
        Darwin)
            echo "Platform: macOS"
            if ! command -v brew &>/dev/null; then
                step "Installing Homebrew"
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            else
                ok "Homebrew already installed"
            fi
            if ! xcode-select -p &>/dev/null; then
                step "Installing Xcode Command Line Tools"
                xcode-select --install
                warn "Follow the prompt, then re-run this script once CLT installation finishes."
                exit 0
            else
                ok "Xcode Command Line Tools already installed"
            fi
            ;;
        Linux)
            echo "Platform: Linux"
            command -v apt-get &>/dev/null || die "This script requires a Debian/Ubuntu system (apt-get not found)"
            ;;
        *)
            die "Unsupported platform: $OS — use setup.ps1 on Windows"
            ;;
    esac

    ensure_go
    ensure_node
    [ "$OS" = "Linux" ] && ensure_linux_deps
    ensure_wails

    echo -e "\n\033[1;32m=== Setup complete! ===\033[0m"
    echo ""
    echo "You may need to reload your shell for PATH changes to take effect:"
    echo "  source ~/.profile"
    echo ""
    echo "Then run the app:"
    echo "  wails dev        # development (hot reload)"
    echo "  wails build      # production binary → build/bin/ayayron"
}

main
