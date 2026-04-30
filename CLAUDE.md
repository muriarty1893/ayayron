# Ayayron — Claude Code Context

## Project Overview

Desktop job application tracker. Single binary (Wails v2 = Go backend + React frontend).
Local SQLite database, no server, no internet required at runtime.

## Architecture

```
Go backend (app.go) ←→ Wails JS bindings ←→ React frontend
        ↓
internal/repository  ←→  GORM  ←→  SQLite (~/.config/ayayron/ayayron.db)
```

**Wails-bound methods** are on `*App` in `app.go`. Every exported method becomes callable from TypeScript via `wailsjs/go/main/App`. After changing Go method signatures, restart `wails dev` to regenerate bindings.

**Frontend bindings** live in `frontend/wailsjs/` — auto-generated, never edit manually.

## Key Files

| File | Purpose |
|------|---------|
| `app.go` | All Wails-bound backend methods |
| `internal/models/application.go` | JobApplication struct + Status enum |
| `internal/models/stats.go` | Dashboard stat DTOs |
| `internal/repository/application_repo.go` | All DB queries |
| `internal/database/database.go` | GORM init, DB path |
| `frontend/src/services/applications.ts` | TS wrapper around Wails bindings |
| `frontend/src/types/application.ts` | Frontend type definitions |
| `frontend/src/constants/statuses.ts` | Status labels, colors, pipeline order |

## Status Pipeline

```
applied → phone_screen → technical_interview → final_interview → offer
                                                               → rejected
                                                               → withdrawn
```

Defined in `internal/models/application.go` (Go) and `frontend/src/constants/statuses.ts` (TS).
`STATUS_ORDER` in both files controls display order everywhere (table, kanban columns, form).

## Development

```bash
wails dev        # hot reload dev mode
wails build      # production binary → build/bin/ayayron
go test ./...    # run Go tests
```

**Linux requirement:** `libgtk-3-dev` + `libwebkit2gtk-4.1-dev` + webkit4.0 symlink.
See README for one-time setup.

## Adding Features

**New DB field:** Add to `JobApplication` struct → GORM AutoMigrate handles it on next launch → update `ApplicationInput` in repo → update `ApplicationForm` in frontend.

**New status:** Add to `Status` const in `models/application.go` + `STATUS_ORDER` in `constants/statuses.ts`. Both must stay in sync.

**New backend method:** Add to `app.go` → restart `wails dev` → new TS binding appears in `wailsjs/go/main/App` → add wrapper in `services/applications.ts`.

## State Management

TanStack Query handles all server state. Query keys:
- `['applications', filter]` — list with filters
- `['stats']` — dashboard counts
- `['statusDist']` — donut chart data
- `['timeseries', days]` — area chart data
- `['recent', limit]` — recent applications list

Mutations invalidate relevant keys on success. Kanban drag uses optimistic updates.

## Conventions

- Date wire format: ISO 8601 strings between JS and Go (`time.Time` ↔ `string`)
- Salary fields are nullable (`*int` in Go, `number | null` in TS) — `null` means not specified
- HashRouter is required (Wails built binary uses `file://`, no real server routing)
