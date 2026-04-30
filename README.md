# Ayayron

A desktop job application tracker built with Wails v2, Go, and React. Track your job applications through the hiring pipeline with a dashboard, filterable table, and drag-and-drop Kanban board.

## Screenshots

| Dashboard | Applications | Kanban |
|-----------|-------------|--------|
| ![Dashboard](img/Screenshot%20from%202026-04-30%2016-59-24.png) | ![Applications](img/Screenshot%20from%202026-04-30%2016-59-36.png) | ![Kanban](img/Screenshot%20from%202026-04-30%2016-59-45.png) |

## Features

- **Dashboard** — stats overview, status distribution chart, applications over time, recent activity
- **Applications table** — search, filter by status, sort columns, inline status changes
- **Kanban board** — drag and drop applications between pipeline stages
- **Full CRUD** — add, edit, delete applications with form validation
- **Dark mode** — default dark, toggleable, persists across sessions
- **Local storage** — SQLite database stored at `~/.config/ayayron/ayayron.db`

## Pipeline Stages

```
Applied → Phone Screen → Technical Interview → Final Interview → Offer / Rejected / Withdrawn
```

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Desktop   | [Wails v2](https://wails.io)                    |
| Backend   | Go 1.23, GORM, SQLite (pure-Go, no CGO)         |
| Frontend  | React 18, TypeScript 5, Vite                    |
| UI        | Tremor, Tailwind CSS v3                         |
| State     | TanStack Query v5                               |
| Forms     | React Hook Form + Zod                           |
| Kanban    | dnd-kit                                         |

## Requirements

### Runtime
- Linux with WebKit2GTK 4.0 or 4.1

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
├── main.go                          # Wails entrypoint, window config
├── app.go                           # Wails-bound App struct (all backend methods)
├── wails.json                       # Wails project config
├── internal/
│   ├── database/database.go         # GORM + SQLite init, DB path resolution
│   ├── models/
│   │   ├── application.go           # JobApplication struct, Status enum
│   │   └── stats.go                 # Dashboard stats DTOs
│   └── repository/application_repo.go  # CRUD + aggregation queries
└── frontend/
    └── src/
        ├── components/
        │   ├── dashboard/           # StatCards, StatusDonut, AreaChart, RecentList
        │   ├── forms/               # ApplicationForm (add/edit modal)
        │   ├── kanban/              # KanbanBoard, KanbanColumn, KanbanCard
        │   ├── layout/              # AppShell, Sidebar, TopBar
        │   ├── table/               # ApplicationsTable, TableFilters
        │   └── ui/                  # StatusBadge, ConfirmDialog, EmptyState
        ├── hooks/                   # useApplications, useDashboardStats, useTheme
        ├── pages/                   # DashboardPage, ApplicationsPage, KanbanPage
        ├── services/applications.ts # Wails JS bindings wrapper
        ├── types/application.ts     # TypeScript type definitions
        └── constants/statuses.ts    # Status labels, colors, order
```

## License

MIT — see [LICENSE](LICENSE)
