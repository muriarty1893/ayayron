# Ayayron — Claude Code Context

## Project Overview

Cross-platform desktop app that automates dev environment setup on a fresh OS install. Single binary (Wails v2 = Go backend + React frontend). Users pick categories or preset profiles, the app detects already-installed tools, installs missing ones, and streams live terminal output. Installation history is persisted to SQLite.

## Architecture

```
Go backend (app.go) ←→ Wails JS bindings ←→ React frontend
        ↓                       ↓
internal/registry         runtime.EventsEmit  →  useInstallation (EventsOn)
internal/repository  ←→  GORM  ←→  SQLite (~/.config/ayayron/ayayron.db)
```

**Tool definitions are hardcoded** in `internal/registry/tools.go` — not in the DB. Only `Installation` records (history) are persisted.

**Wails-bound methods** are on `*App` in `app.go`. Every exported method becomes callable from TypeScript via `wailsjs/go/main/App`. After changing Go method signatures, restart `wails dev` to regenerate bindings.

**Frontend bindings** live in `frontend/wailsjs/` — auto-generated, never edit manually.

## Key Files

| File | Purpose |
|------|---------|
| `app.go` | 6 Wails-bound methods + goroutine for async installation |
| `internal/models/tool.go` | Tool, Category, Profile, InstallStatus types |
| `internal/models/installation.go` | Installation GORM model |
| `internal/registry/tools.go` | 30+ hardcoded tool definitions + preset profiles |
| `internal/repository/installation_repo.go` | Create + List installation history |
| `internal/database/database.go` | GORM init, DB path |
| `frontend/src/services/tools.ts` | TS wrapper around Wails bindings |
| `frontend/src/types/tool.ts` | Frontend type definitions + event payload types |
| `frontend/src/constants/categories.ts` | Category labels, descriptions, Tailwind class maps |

## Wails-Bound Methods

```
GetPlatform() string                              → "linux" | "windows"
GetTools() []Tool                                 → all tools with IsInstalled populated
GetProfiles() []Profile                           → preset profiles
StartInstallation(toolIDs []string) error         → async goroutine, emits events
CancelInstallation() error                        → kills running process group
GetInstallationHistory(limit int) []Installation
```

## Event Streaming (Go → React)

```
install:start     { total, toolIds }
install:progress  { current, total, toolId, toolName }
install:line      { toolId, line, isStderr }
install:toolDone  { toolId, success, durationMs }
install:done      { installed, failed, skipped }
```

React subscribes via `EventsOn` in `useInstallation` — subscribed on `WizardPage` mount (before user clicks), unsubscribed on unmount.

## Tool Categories

`core` · `languages` · `databases` · `cloud` · `editors` · `terminal`

Defined as `Category` string constants in `internal/models/tool.go` and mirrored in `frontend/src/types/tool.ts`.

## Development

```bash
wails dev        # hot reload dev mode (regenerates wailsjs bindings on Go changes)
wails build      # production binary → build/bin/ayayron
go test ./...    # run Go tests
```

**Linux requirement:** `libgtk-3-dev` + `libwebkit2gtk-4.1-dev` + webkit4.0 symlink.
See REQUIREMENTS.md for one-time setup.

## Adding a New Tool

1. Add a `Tool{}` struct entry in `internal/registry/tools.go`
2. Set `LinuxCmd`, `WindowsCmd`, `CheckCmd`, `RequiresSudo` appropriately
3. No DB migration needed — tools are hardcoded

## Adding a New Category

1. Add a `Category` const to `internal/models/tool.go`
2. Add the same string to the `Category` type in `frontend/src/types/tool.ts`
3. Add entries to all maps in `frontend/src/constants/categories.ts` (labels, descriptions, ring colors, icon colors)
4. Add an icon entry to `ICONS` in `frontend/src/components/ui/CategoryCard.tsx`

## Adding a New Backend Method

Add to `app.go` → restart `wails dev` → new TS binding appears in `wailsjs/go/main/App` → add wrapper in `services/tools.ts`.

## State Management

TanStack Query handles all server state. Query keys:
- `['tools']` — all tools with IsInstalled; `staleTime: Infinity` (stable within session)
- `['profiles']` — preset profiles; `staleTime: Infinity`
- `['platform']` — OS string; `staleTime: Infinity`
- `['history', limit]` — installation history; invalidated after `install:done`

## Tailwind Class Safety

Never build class names dynamically (e.g. `ring-${color}-500` — Tailwind purges them). Use explicit mapping objects like `CATEGORY_RING` and `CATEGORY_ICON_COLOR` in `constants/categories.ts`.

## Conventions

- Tool definitions are Go structs; tool IDs are short slugs (e.g. `"git"`, `"nodejs"`)
- `Set<string>` in React state — always `new Set(prev.selectedToolIds)` before mutating
- HashRouter is required (Wails built binary uses `file://`, no real server routing)
- Process group kill on cancel: `SysProcAttr{Setpgid: true}` so cancel kills bash and all child processes
