# Ayayron

A cross-platform desktop GUI for the [setup-dev-environment](https://github.com/kartalbas/setup-dev-environment) scripts. On a fresh OS install, open Ayayron, pick your tool categories or a preset profile, and it runs the appropriate shell/PowerShell script for you — streaming live output while it works.

## Features

- **3-step wizard** — choose categories → pick tools → watch live installation
- **Script-based installs** — delegates to battle-tested bash/PowerShell scripts; no custom install logic
- **Auto-detection** — checks which tools are already installed on startup; shows badges
- **Preset profiles** — Minimal Dev, Full Stack JS, Go Developer, Data Science
- **Live terminal** — real-time streaming output with ANSI-stripped clean lines
- **Sudo/admin tools** — shown with a lock badge; triggers pkexec / osascript / UAC prompt
- **Installation history** — SQLite log of every past install run
- **Cross-platform** — Linux (bash + apt), macOS (bash + Homebrew), Windows (PowerShell + winget/scoop)
- **Single binary** — scripts are embedded via `go:embed`; nothing to distribute alongside the app

## Tool Categories

| Category | Examples |
|----------|----------|
| Core | git, curl, wget, jq, ripgrep, build-essential, cmake |
| Languages | Node.js (NVM), Go, Python 3, Rust, Java, Ruby, PHP |
| Databases | PostgreSQL, MySQL, SQLite3, Redis, MongoDB |
| Cloud & DevOps | Docker, kubectl, Helm, Terraform, AWS CLI, Azure CLI |
| Editors | VS Code, Neovim, Vim |
| Terminal | Starship, tmux, fzf, zoxide, bat |
| Apps & Fonts | Browsers, GUI apps (macOS casks), fonts |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | [Wails v2](https://wails.io) |
| Backend | Go 1.23, GORM, SQLite (pure-Go, no CGO) |
| Frontend | React 18, TypeScript 5, Vite |
| UI | Tailwind CSS v3, Heroicons |
| State | TanStack Query v5 |
| Routing | React Router v7 (HashRouter) |

## Requirements

### Runtime
- **Linux:** WebKit2GTK 4.0 or 4.1
- **macOS:** macOS 10.13 (High Sierra) or newer
- **Windows:** Windows 10+ with WebView2 runtime

### Development
- Go 1.21+
- Node.js 18+
- Wails CLI v2: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- Linux system packages:
  ```bash
  sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev
  # webkit2gtk-4.0 symlink (required by Wails):
  sudo ln -s /usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.1.pc \
             /usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.0.pc
  ```

## Getting Started

### 1. Install build dependencies (one-time)

**Linux / macOS:**
```bash
bash setup.sh
source ~/.profile   # reload PATH if needed
```

**Windows** (PowerShell as Administrator):
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

The script installs Go 1.22, Node.js 20, Wails CLI, and on Linux the required GTK/WebKit system libraries.

### 2. Run or build

```bash
wails dev        # development mode with hot reload
wails build      # production binary → build/bin/ayayron
```

Output binary: `build/bin/ayayron`

## Project Structure

```
ayayron/
├── main.go
├── app.go                               # 6 Wails-bound methods + goroutine
├── wails.json
├── internal/
│   ├── database/database.go             # GORM + SQLite init
│   ├── models/
│   │   ├── tool.go                      # Tool, Category, Profile, PermissionLevel types
│   │   └── installation.go             # Installation GORM model (persisted)
│   ├── registry/
│   │   ├── parse.go                     # INI config parser → []Tool
│   │   ├── checks.go                    # tool key → check command map
│   │   └── descriptions.go             # static description strings for known tools
│   ├── repository/installation_repo.go  # Create + List history queries
│   └── scripts/
│       ├── embed.go                     # go:embed declaration
│       ├── scripts.go                   # ReadConfig, ExtractToTemp, GenerateConfig
│       └── files/                       # bundled scripts + configs (6 files)
│           ├── ubuntu.sh / ubuntu.config
│           ├── macos.sh  / macos.config
│           └── windows.ps1 / windows.config
└── frontend/src/
    ├── components/
    │   ├── wizard/                      # WizardShell, StepCategories, StepTools, StepInstall
    │   ├── install/                     # LiveTerminal, InstallProgress
    │   ├── history/                     # HistoryList
    │   ├── layout/                      # AppShell, Sidebar, TopBar
    │   └── ui/                          # CategoryCard, ProfileCard, ToolItem, ToolBadge, SudoWarning
    ├── hooks/                           # useTools, useWizard, useInstallation
    ├── pages/                           # WizardPage, HistoryPage
    ├── services/tools.ts                # Wails bindings wrapper
    ├── types/tool.ts                    # TypeScript type definitions
    └── constants/categories.ts         # Category labels, colors, Tailwind class maps
```

## Updating Bundled Scripts

The scripts in `internal/scripts/files/` are copies from [kartalbas/setup-dev-environment](https://github.com/kartalbas/setup-dev-environment). To pull in upstream changes:

```bash
cp /path/to/setup-dev-environment/setup-dev-environment-ubuntu.sh  internal/scripts/files/ubuntu.sh
cp /path/to/setup-dev-environment/setup-dev-environment-ubuntu.config internal/scripts/files/ubuntu.config
# repeat for macos and windows
wails build   # re-embeds updated scripts
```

## License

MIT — see [LICENSE](LICENSE)
