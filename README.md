# Ayayron

A cross-platform desktop app that sets up a full development environment on a fresh OS install. Pick your tool categories or a preset profile, and Ayayron auto-detects what's already installed, installs the rest, and streams live terminal output — all without touching a terminal yourself.

## Screenshot

![Applications](img/Screenshot%20from%202026-05-01%2018-11-44.png)

## Features

- **3-step wizard** — choose categories → pick tools → watch live installation
- **Auto-detection** — scans for installed tools on startup; skips what you already have
- **Preset profiles** — Minimal Dev, Full Stack JS, Go Developer, Data Science
- **Live terminal** — real-time streaming output from every install command
- **Sudo/admin warning** — banner appears when any selected tool requires elevated privileges
- **Installation history** — SQLite log of every past install run
- **Cross-platform** — Linux (apt-get / curl scripts) and Windows (winget)

## Tool Categories

| Category | Examples |
|----------|----------|
| Core | git, curl, wget, jq, make |
| Languages | Node.js (NVM), Go, Python 3, Rust |
| Databases | PostgreSQL, MySQL, SQLite3, Redis |
| Cloud | Docker, kubectl, Terraform, AWS CLI, gcloud |
| Editors | VS Code, Neovim, Vim |
| Terminal | tmux, Oh My Zsh, zsh, fzf, ripgrep |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | [Wails v2](https://wails.io) |
| Backend | Go 1.23, GORM, SQLite (pure-Go, no CGO) |
| Frontend | React 18, TypeScript 5, Vite |
| UI | Tremor, Tailwind CSS v3, Heroicons |
| State | TanStack Query v5 |
| Routing | React Router v7 (HashRouter) |

## Requirements

### Runtime
- **Linux:** WebKit2GTK 4.0 or 4.1
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

```bash
# Clone and enter project
cd ayayron

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run in development mode (hot reload)
wails dev

# Build production binary
wails build
# Output: build/bin/ayayron
```

## Project Structure

```
ayayron/
├── main.go
├── app.go                               # 6 Wails-bound methods
├── wails.json
├── internal/
│   ├── database/database.go             # GORM + SQLite init
│   ├── models/
│   │   ├── tool.go                      # Tool, Category, Profile, InstallStatus types
│   │   └── installation.go             # Installation GORM model (persisted)
│   ├── registry/tools.go               # 30+ hardcoded tool definitions + presets
│   └── repository/installation_repo.go # Create + List history queries
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
    └── constants/categories.ts         # Category labels, colors, Tailwind classes
```

## License

MIT — see [LICENSE](LICENSE)
