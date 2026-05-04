# Ayayron — Claude Code Context

## Project Overview

Cross-platform desktop GUI for the [kartalbas/setup-dev-environment](https://github.com/kartalbas/setup-dev-environment) scripts. Single binary (Wails v2 = Go backend + React frontend). Users pick tool categories or preset profiles; the app generates a modified INI config, extracts the bundled script to a temp dir, and runs it — streaming live output to the terminal UI. Installation history is persisted to SQLite.

## Architecture

```
GUI (React wizard)
  → user picks tools → StartInstallation(toolIDs)   ← Wails binding
        → scripts.ReadConfig(platform)               ← reads embedded .config
        → scripts.GenerateConfig(base, enabledIDs)   ← writes modified INI
        → scripts.ExtractToTemp(platform)            ← extracts .sh/.ps1 + config to /tmp
        → exec bash/pwsh script --user --config …    ← real installer runs
        → parse stdout/stderr for ✓/✗ patterns       ← emits install:toolDone per tool
  ← EventsOn("install:line" …)                      ← LiveTerminal renders
```

**Scripts are bundled** via `go:embed` in `internal/scripts/files/` — not downloaded at runtime. Only `Installation` records (history) are persisted to SQLite.

**Tool list is dynamic** — parsed from the embedded config file each time `GetTools()` is called. Tool IDs use the format `Section.key` (e.g. `"UserLevel.CoreTools.git"`).

**Wails-bound methods** are on `*App` in `app.go`. After changing Go method signatures, restart `wails dev` to regenerate bindings in `frontend/wailsjs/`.

## Key Files

| File | Purpose |
|------|---------|
| `app.go` | 6 Wails-bound methods + goroutine for async installation |
| `internal/models/tool.go` | Tool, Category, Profile, PermissionLevel, InstallStatus types |
| `internal/models/installation.go` | Installation GORM model |
| `internal/registry/parse.go` | INI config parser → `[]Tool`; section→category mapping |
| `internal/registry/checks.go` | Static `toolKey → checkCmd` map; `DetectTool()` |
| `internal/registry/descriptions.go` | Static description strings for ~70 known tools |
| `internal/scripts/embed.go` | `//go:embed files` declaration |
| `internal/scripts/scripts.go` | `ReadConfig`, `ExtractToTemp`, `GenerateConfig` |
| `internal/scripts/files/` | 6 bundled files: ubuntu/macos/windows .sh/.ps1 + .config |
| `internal/repository/installation_repo.go` | Create + List installation history |
| `internal/database/database.go` | GORM init, DB path (`~/.config/ayayron/ayayron.db`) |
| `frontend/src/services/tools.ts` | TS wrapper around Wails bindings |
| `frontend/src/types/tool.ts` | Frontend type definitions + event payload types |
| `frontend/src/constants/categories.ts` | Category labels, descriptions, Tailwind class maps |

## Wails-Bound Methods

```
GetPlatform() string                              → "linux" | "darwin" | "windows"
GetTools() []Tool                                 → parsed from embedded config; IsInstalled populated
GetProfiles() []Profile                           → static preset profiles from registry.Profiles()
StartInstallation(toolIDs []string) error         → async goroutine; extracts script, runs it, streams events
CancelInstallation() error                        → kills running process group
GetInstallationHistory(limit int) []Installation
```

## Event Streaming (Go → React)

```
install:start     { total, toolIds }
install:line      { toolId: "", line, isStderr }   ← script output (ANSI stripped)
install:toolDone  { toolId, success, durationMs }  ← emitted when ✓/✗ parsed in output
install:done      { installed, failed, skipped }
```

React subscribes via `EventsOn` in `useInstallation` — subscribed on `WizardPage` mount (before user clicks), unsubscribed on unmount.

## Tool ID Format

Tool IDs are `Section.key` from the INI config, e.g.:
- `"UserLevel.CoreTools.git"`
- `"UserLevel.Languages.NodeJS.nvm"`
- `"AdminLevel.Databases.postgresql"`

The last segment (after the final `.`) is the config key used in the script. `GenerateConfig` splits IDs on `.` to locate the right section+key and set it to `true` or `false`.

## Permission Levels

- `user` — `UserLevel.*` and `Applications.*` sections; runs `--user` (Linux/macOS) or `-ToolsUserRights` (Windows)
- `admin` — `AdminLevel.*` sections; runs with elevated privileges:
  - Linux: `pkexec env DISPLAY=... bash script --admin`
  - macOS: `osascript 'do shell script ... with administrator privileges'`
  - Windows: `Start-Process powershell -Verb RunAs`
  - macOS `Applications.*` maps to admin pass using `--apps` flag instead of `--admin`

## Tool Categories

`core` · `languages` · `databases` · `cloud` · `editors` · `terminal` · `apps`

Defined as `Category` string constants in `internal/models/tool.go` and mirrored in `frontend/src/types/tool.ts`. The section→category mapping lives in `internal/registry/parse.go` (`sectionCategoryMap`).

## Development

```bash
wails dev                                         # hot reload (regenerates wailsjs bindings)
wails build                                       # production binary for current OS
wails build -platform linux/amd64 -tags webkit2_4_1
wails build -platform darwin/universal
wails build -platform windows/amd64
go test ./...                                     # run Go tests
go test -race ./internal/scripts/... ./internal/registry/...  # test new packages
```

**Linux requirement:** `libgtk-3-dev` + `libwebkit2gtk-4.1-dev` + webkit4.0 symlink.
See REQUIREMENTS.md for one-time setup.

## Adding a New Tool

Tools come from the bundled config files — no Go code change needed for most additions:

1. Add the tool key to `internal/scripts/files/ubuntu.config` (and/or `macos.config`, `windows.config`)
2. Ensure the installation script handles it (edit `ubuntu.sh` etc. if it's a new tool the script doesn't know)
3. Optionally add a description to `internal/registry/descriptions.go`
4. Optionally add a check command to `internal/registry/checks.go` for "already installed" detection

## Adding a New Category

1. Add a `Category` const to `internal/models/tool.go`
2. Add the same string to the `Category` type in `frontend/src/types/tool.ts`
3. Add a mapping entry to `sectionCategoryMap` in `internal/registry/parse.go`
4. Add entries to all maps in `frontend/src/constants/categories.ts` (labels, descriptions, ring colors, icon colors)
5. Add an icon entry to `ICONS` in `frontend/src/components/ui/CategoryCard.tsx`

## Adding a New Backend Method

Add to `app.go` → restart `wails dev` → new TS binding appears in `frontend/wailsjs/go/main/App` → add wrapper in `frontend/src/services/tools.ts`.

## State Management

TanStack Query handles all server state. Query keys:
- `['tools']` — parsed tool list with IsInstalled; `staleTime: Infinity` (stable within session)
- `['profiles']` — preset profiles; `staleTime: Infinity`
- `['platform']` — OS string; `staleTime: Infinity`
- `['history', limit]` — installation history; invalidated after `install:done`

## Tailwind Class Safety

Never build class names dynamically (e.g. `ring-${color}-500` — Tailwind purges them). Use explicit mapping objects like `CATEGORY_RING` and `CATEGORY_ICON_COLOR` in `constants/categories.ts`.

## Conventions

- Tool IDs are `Section.key` slugs — the last segment matches the config file key
- `Set<string>` in React state — always `new Set(prev.selectedToolIds)` before mutating
- HashRouter is required (Wails built binary uses `file://`, no real server routing)
- Process group kill on cancel: `SysProcAttr{Setpgid: true}` so cancel kills bash and all child processes
- ANSI codes are stripped in Go before emitting `install:line` events — never reach the frontend
