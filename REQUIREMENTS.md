# Requirements

## Runtime Requirements

| Platform | Requirement |
|----------|-------------|
| Linux    | WebKit2GTK 4.0 or 4.1 (`libwebkit2gtk-4.1-0`) |
| macOS    | macOS 10.13 (High Sierra) or newer |
| Windows  | Windows 10+ with WebView2 runtime |

## Development Requirements

### All platforms
- Go 1.21 or newer
- Node.js 18 or newer
- npm 9 or newer
- Wails CLI v2.12+

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Linux only

```bash
# Install system dependencies
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev

# Wails expects webkit2gtk-4.0 — create a symlink if only 4.1 is available
sudo ln -s /usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.1.pc \
           /usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.0.pc
```

### macOS only

Xcode Command Line Tools are required (prompted automatically on first build):

```bash
xcode-select --install
```

### Windows only

Install the WebView2 runtime if not already present (ships with Windows 11 by default):  
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Go Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `github.com/wailsapp/wails/v2` | v2.12.0 | Desktop app framework + JS bindings + event streaming |
| `gorm.io/gorm` | v1.31.1 | ORM for installation history |
| `github.com/glebarez/sqlite` | v1.11.0 | Pure-Go SQLite driver (no CGO) |

## Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18 | UI framework |
| `typescript` | 5 | Type safety |
| `tailwindcss` | 3 | Utility CSS |
| `@tanstack/react-query` | 5 | Server state + query invalidation after install |
| `react-router-dom` | 7 | HashRouter (required for Wails `file://` protocol) |
| `@heroicons/react` | 2 | Icon set |
| `date-fns` | 3 | Relative date formatting in history |

## Verify Setup

```bash
wails doctor
```

This command checks all dependencies and reports what is missing.

## Bundled Scripts

The installer scripts are embedded directly into the binary at build time via `go:embed`. No external files need to be distributed alongside the application.

Scripts bundled in `internal/scripts/files/`:

| File | Platform | Purpose |
|------|----------|---------|
| `ubuntu.sh` | Linux | bash installer using apt-get, snap, and curl |
| `ubuntu.config` | Linux | default tool selections |
| `macos.sh` | macOS | bash installer using Homebrew |
| `macos.config` | macOS | default tool selections |
| `windows.ps1` | Windows | PowerShell installer using winget and Scoop |
| `windows.config` | Windows | default tool selections |
