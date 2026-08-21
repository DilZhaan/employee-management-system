# EMS Web Dashboard

React web dashboard for the Enterprise Employee Management System backend.

## Stack

- React 19 with TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Vitest and Testing Library

## Requirements

- Node.js compatible with the Vite version in `package.json`
- Running EMS backend API
- `VITE_API_BASE_URL` pointing at the API, for example `http://localhost:5186`

## Setup

```bash
cd web
npm install
cp .env.example .env.local
```

Edit `.env.local` when the API URL differs:

```bash
VITE_API_BASE_URL=http://localhost:5186
```

Only `VITE_*` values are browser-visible. Do not put secrets, database credentials, JWT signing keys, or passwords in web environment files.

Backend dependency for web setup:

- Start and configure the API first using `api/README.md`.
- Seeded role accounts (`Admin`, `Manager`, `Employee`) are documented in `api/README.md`.
- OpenAPI artifact is available at `/swagger` and `/swagger/v1/swagger.json` on the API host.

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run preview
```

From the repository root:

```bash
make web-install
make web-dev
make web-lint
make web-test
make web-build
make web-verify
```

## Architecture

The web app keeps feature code close to the workflow it supports:

```text
React Router
  -> protected routes and app shell
  -> feature pages
  -> feature hooks
  -> TanStack Query
  -> typed API functions
  -> Axios client
  -> ASP.NET Core API
```

State is intentionally split by responsibility:

- Server state: TanStack Query
- Authentication state: `AuthProvider`
- Form state: React Hook Form
- Form validation: Zod
- List filter and pagination state: React Router search params
- Local UI state: `useState` for dialogs, menus, and temporary controls

Redux and Zustand are not used because the app already has clear owners for each kind of state. Adding another global store would duplicate TanStack Query, React Hook Form, URL state, and authentication context.

## Authentication

Login calls the backend auth endpoint and stores the access token in centralized session storage through `tokenStorage`. `AuthProvider` restores valid sessions, rejects expired or malformed tokens, clears protected query cache on logout, and reacts to API `401` responses. `403` responses preserve the session and are handled as authorization failures.

The frontend decodes JWT claims only for UX decisions. Backend token validation and authorization policies remain authoritative.

## Roles

- Admin: dashboard, employee management, department management, attendance review, leave review
- Manager: dashboard, departments, own attendance, attendance review, own leave, leave review
- Employee: dashboard, departments, own attendance, own leave

Frontend role checks hide unavailable actions. Backend RBAC remains the security boundary.

## SOLID-Inspired Design

- Single responsibility: API modules, query hooks, forms, tables, route guards, and layout components have focused jobs.
- Open/closed: shared components such as badges, pagination, dialogs, and tables accept props rather than being copied for small variations.
- Interface segregation: component props stay small and workflow-specific.
- Dependency inversion: feature UI depends on typed API functions and hooks rather than raw Axios setup.

React composition is used instead of class inheritance.

## Project Structure

```text
src/
  api/             typed API client and endpoint modules
  app/             providers, query client, router
  auth/            token parsing, storage, auth events
  components/      reusable UI, layout, and state components
  features/        workflow-specific pages, hooks, schemas, components
  lib/             formatting and utility helpers
  test/            test setup and auth helpers
  types/           shared API/domain TypeScript contracts
```

## Testing

Tests cover authentication routing, login validation, employee and department management, attendance workflows, and leave workflows. API calls are mocked at the typed endpoint boundary so page behavior, forms, routing, query invalidation, and RBAC UX are exercised without relying on a live backend.

