# Copilot instructions for chatapp

## Build, test, and lint commands
- Install: `bun install` (project uses Bun workspaces)
- Start all apps (dev): `bun run dev`
- Start web app (dev): `bun run --filter web dev` or `bun run dev:web`
- Start server (dev): `bun run --filter server dev` or `bun run dev:server`
- Build all: `bun run build`
- Build a single workspace: `bun run --filter <workspace> build` (e.g. `bun run --filter web build`)
- Type-check all: `bun run check-types`
- Type-check a package: `bun run --filter <workspace> check-types` (packages/ui exposes `check-types`)
- Tests: no test runner configured in repo. If tests are added, run them via the target workspace script (e.g. `bun run --filter web test`).
- Lint: no global lint script present; rely on package-specific scripts if added.

Notes:
- Root package.json uses workspace-aware scripts (e.g., `bun run --filter '*' dev`) and also exposes convenience scripts `dev:web` and `dev:server`.

## High-level architecture (big picture)
- Monorepo managed by Bun workspaces (root package.json "workspaces" includes `apps/*` and `packages/*`).
- apps/
  - web/ — Next.js frontend (runs on port 3001 in README examples).
  - server/ — Express backend (TypeScript, uses tsdown and Bun build/compile, API default port 3000).
- packages/ — Shared packages used by apps, e.g.:
  - ui/ — shared shadcn UI components and global styles
  - auth/ — authentication logic (exports via `@chatapp/auth`)
  - db/ — DB models/queries (Mongoose)
  - env/, config/ — environment and configuration helpers
- Inter-package imports use the `@chatapp/*` scope and package `exports` mapping. Workspaces use `workspace:*` for internal deps.

## Key conventions and patterns
- Runtime & package manager: Bun (packageManager: `bun@...`) — scripts expect `bun` installed.
- Workspace scripts: Prefer using the root convenience scripts (e.g., `bun run dev`, `bun run build`) or `bun run --filter <workspace> <script>` to target one workspace.
- TypeScript: `check-types` script is provided at root and in some packages (`packages/ui`). Server build uses `tsdown` and `bun build --compile` for a native binary.
- package.json placeholders:
  - `workspace:*` denotes internal workspace dependency.
  - `catalog:` appears in several dependencies (a project-specific catalog alias); do not replace it without verifying the catalog system.
- Module type: many packages set `type: "module"` and use `exports` maps — rely on those mappings when referencing package internals.
- Environment files:
  - Per-app `.env` files are located under `apps/*/.env` and `packages/env` contains shared env helpers.
  - CI/deploy workflows expect certain secrets (see CI notes below).
- UI: uses shadcn primitives and a shared `packages/ui`; run shadcn CLI with the `-c packages/ui` flag to add shared components.

## CI & deployment notes
- .github/workflows/ci-cd.yaml contains a deploy job that deploys via SSH using secrets:
  - `DEPLOY_HOST`, `DEPLOY_USERNAME`, `SSH_PRIVATE_KEY` — keep them in repo secrets.
- .github/workflows/actions-demo.yml is an example/demo workflow.

## AI/assistant-related files
- apps/web/CLAUDE.md exists (references project-specific agent notes). No other AI assistant rule files found (.cursorrules, CONVENTIONS.md, AIDER_CONVENTIONS.md, .windsurfrules, etc.).

## Quick commands (cheat-sheet)
- Install deps: `bun install`
- Dev (all): `bun run dev`
- Dev (web only): `bun run dev:web` or `bun run --filter web dev`
- Dev (server only): `bun run dev:server` or `bun run --filter server dev`
- Build all: `bun run build`
- Type-check package: `bun run --filter <workspace> check-types`

---

If you add test or lint tooling later, update this file with the exact test/lint commands and examples for running a single test.
