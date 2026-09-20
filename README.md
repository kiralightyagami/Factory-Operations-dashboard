# Factory Operations Dashboard

A real-time production control dashboard for monitoring factory work orders, machine status, and production metrics. Built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Work order tracking** — browse, search, and filter production jobs by status, customer, product, or machine
- **Live summary metrics** — KPI cards for total work orders, delayed jobs, due-soon jobs, and completion rate
- **Sorting & filtering** — sort by due date or quantity, toggle ascending/descending order, and filter by job status
- **Detail panel** — slide-out panel for inspecting a single job, updating its status, and editing operation notes
- **Mock API** — in-memory `GET` (search, filter, sort) and `PATCH` (status / notes updates) endpoints under `/api/jobs`

## Tech Stack

| Category       | Choice                            |
| -------------- | --------------------------------- |
| Framework      | Next.js 16 (App Router)           |
| Language       | TypeScript                        |
| Styling        | Tailwind CSS v4, shadcn/ui        |
| Icons          | Lucide React                      |
| Package Mgr    | Bun                               |
| Deployment     | Vercel-ready                    |

## Setup

### Prerequisites

- **Bun** `1.3.4` (set in `package.json` via `packageManager`)
- Node.js 20+ (for the Next.js toolchain)

### Install dependencies

```bash
bun install
```

> This project uses `bun.lock` as its lockfile. If you prefer npm or pnpm, run `npm install` / `pnpm install` instead — the dependency tree is identical, though Bun is recommended for the fastest cold start.

### Run the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard. The page hot-reloads as you edit source files.

### Other scripts

| Script         | Description                                   |
| -------------- | --------------------------------------------- |
| `bun dev`      | Start the Next.js dev server with Turbopack   |
| `bun run build`| Produce an optimized production build         |
| `bun start`    | Run the compiled production server            |
| `bun run lint` | Run ESLint across the project                 |

## Component Structure

The application lives under `src/` and follows a **feature- grouped** layout that separates App Router pages / routes, reusable UI, and application logic.

```
src/
├── app/                      # App Router (pages & API)
│   ├── layout.tsx            # Root layout – global fonts, metadata, providers
│   ├── page.tsx              # Home page – mounts <Container><Dashboard /></Container>
│   ├── globals.css           # Tailwind base + design-token CSS variables (light/dark)
│   ├── favicon.ico
│   └── api/
│       └── jobs/
│           └── route.ts      # In-memory jobs API (GET search/filter/sort, PATCH update)
├── components/               # Application (domain) components
│   ├── container.tsx         # Centred max-width layout wrapper
│   ├── dashboard.tsx         # Orchestrator – holds global state, wires everything together
│   ├── summary-cards.tsx     # KPI metric cards (Total / Delayed / Due Soon / Completed)
│   ├── job-filters.tsx       # Search bar, status tabs, sort controls, result count
│   ├── jobs-table.tsx        # Work-orders data table with due-date badges & machine status
│   ├── job-detail-panel.tsx  # Slide-out detail drawer – status update + notes editor
│   └── ui/                   # shadcn/ui primitives (component library)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
└── lib/                      # Utilities, types & data
    ├── types.ts              # Job, Machine, JobStatus, SortField/SortOrder types
    ├── mock-data.ts          # Seed data – 8 machines, 15 sample production jobs
    └── utils.ts              # `cn()` helper (clsx + tailwind-merge)
```

### How it fits together

- **`app/page.tsx`** is the single entry point — it renders a `Container` around the `Dashboard`.
- **`Dashboard`** (`components/dashboard.tsx`) is the **client component** that owns all UI state: the job list, active filters, sort settings, the selected job, and panel open/close state. It fetches the job list from `/api/jobs` on mount and on every refresh, keeps a local optimistic copy, and patches changes back to the API.
- **`SummaryCards`** renders high-level KPIs. Clicking a card (Total / Delayed / Completed) filters the list by status.
- **`JobFilters`** provides the search input, status tabs with per-status counts, and sort field/order toggles.
- **`JobsTable`** renders the filtered + sorted jobs as a table. Each row is clickable to open the detail panel; overdue and due-today badges are computed client-side.
- **`JobDetailPanel`** is a fixed slide-over drawer (right-side) that shows full job details, a machine status indicator, inline status-update buttons, and an editable notes textarea. It supports `Esc` to close.
- **`api/jobs/route.ts`** is a lightweight in-memory store seeded from `mock-data.ts`. `GET` supports `search`, `status`, `sort`, and `order` query params; `PATCH` updates a job's `status` or `notes`.

> The `@/*` path alias (configured in `tsconfig.json`) maps to `src/`, so imports look like `@/components/dashboard`, `@/lib/types`, etc.

## Project Conventions

- **shadcn/ui + Base UI** — primitives are built on `@base-ui/react` and styled with `class-variance-authority`. The design tokens (colors, radius, fonts) live in `globals.css` as CSS variables supporting light and dark themes.
- **`cn()` utility** — `clsx` + `tailwind-merge` via `src/lib/utils.ts`, used throughout for conditional class composition.
- **Type alias import in layout** — `RootLayout` uses Next 16's `LayoutProps<"/">` helper from `next`.
