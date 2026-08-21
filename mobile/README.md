# EMS Mobile

React Native mobile client for the Enterprise Employee Management System. The app is built with Expo and TypeScript and shares the completed ASP.NET Core API used by the web dashboard.

## Stack

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- React Navigation
- TanStack Query
- Axios
- React Hook Form with Zod
- Expo SecureStore
- Jest with React Native Testing Library

## Requirements

- Node.js and npm
- Expo CLI through `npx expo`
- iOS Simulator, Android Emulator, or a physical device with Expo Go
- Running EMS backend API

## Setup

```bash
cd mobile
npm install
cp .env.example .env
```

Set the API URL:

```text
EXPO_PUBLIC_API_BASE_URL=http://YOUR_DEVELOPMENT_API_HOST:5186
```

Do not put backend secrets, JWT signing keys, database connection strings, or passwords in mobile environment files. `EXPO_PUBLIC_*` values are bundled into client software.

Backend dependency for mobile setup:

- Configure and run API/database first via `api/README.md`.
- Seeded role accounts (`Admin`, `Manager`, `Employee`) are documented in `api/README.md`.
- OpenAPI artifact is available at `/swagger` and `/swagger/v1/swagger.json` on the API host.

## API URL Notes

`localhost` from a simulator or phone does not always mean the development Mac.

- iOS Simulator can often use `http://localhost:5186`.
- Android Emulator commonly needs `http://10.0.2.2:5186`.
- Physical devices need the Mac LAN IP, and the backend must be reachable from that device.

Keep those values in `.env`; do not hardcode machine-specific hosts in source.

## Commands

```bash
npm start
npm run ios
npm run android
npm run lint
npm test
npm run typecheck
```

## Architecture

```text
Screen
  -> Feature hook
  -> TanStack Query
  -> Typed API function
  -> Axios client
  -> ASP.NET Core API
```

Ownership:

```text
Server state       TanStack Query
Authentication     dedicated auth provider when login is connected
Forms              React Hook Form
Navigation         React Navigation
Local UI           useState/useReducer
```

Redux and Zustand are not included because the current mobile client does not need another global state manager.

## Project Shape

```text
src/app             providers and navigation
src/api             Axios client, endpoint modules, normalized errors
src/components/ui   reusable native UI primitives
src/features        screen and feature-local files
src/storage         SecureStore wrapper
src/types           mobile-facing API contracts
src/theme           colors, spacing, typography
src/utils           small shared utilities
```

## Security

JWT persistence is centralized through `src/storage/tokenStorage.ts` and uses Expo SecureStore. SecureStore improves device-side token protection, but backend authentication and authorization remain authoritative. The app does not store passwords, password hashes, database credentials, or signing secrets.

## Authentication Flow

```text
App launch
  -> AuthProvider restores SecureStore token
  -> Valid token: authenticated tabs
  -> Missing/invalid/expired token: login
```

Login flow:

```text
LoginScreen
  -> React Hook Form + Zod
  -> useLogin mutation
  -> authApi.login (/api/v1/auth/login)
  -> AuthProvider.establishSession
  -> SecureStore + in-memory bearer token + authenticated navigation
```

## Session Restoration

- `AuthProvider` reads `ems_access_token` from `Expo SecureStore` at startup.
- Malformed or expired tokens are removed and the app stays on Login.
- While restoration is in progress, the app shows a restoration loading view to avoid auth-screen flashes.

## Bearer Token Attachment

- `src/api/client/apiClient.ts` uses a request interceptor.
- The interceptor reads the current token from `src/auth/sessionToken.ts`.
- When a token exists, requests include `Authorization: Bearer <token>`.
- Login requests are sent without session invalidation behavior (`skipAuthInvalidation: true`).

## 401 and 403 Behavior

- Login `401`: treated as invalid credentials and shown in the login form.
- Protected API `401`: triggers centralized session invalidation.
- `403`: does not log out the user; authentication remains active.

## Logout

Logout (exposed on the Profile screen) performs:

- SecureStore token removal
- in-memory bearer token clear
- AuthProvider state clear
- TanStack Query cache clear
- automatic navigation fallback to Login through auth-state re-render

## State Ownership

```text
Auth/session state     -> AuthProvider + useAuth
Persistent token       -> tokenStorage (Expo SecureStore)
In-memory bearer token -> sessionToken
Server state           -> TanStack Query
Login form             -> React Hook Form + Zod
Navigation             -> React Navigation auth-based tree
```

## Attendance

Employee attendance uses authenticated backend APIs and TanStack Query server state:

- Home fetches today's attendance from `/api/v1/attendance/me` using `from` and `to` filters for the current date.
- Check In uses `POST /api/v1/attendance/check-in` with `{ deviceType: "Mobile" }`.
- Check Out uses `POST /api/v1/attendance/check-out`.
- Attendance history uses `/api/v1/attendance/me` with paginated requests and infinite scrolling.

Behavior:

- Attendance actions are server-authoritative: on success, attendance queries are invalidated and refetched.
- Pull-to-refresh is supported on the Attendance history list.
- Loading, empty, and error states are handled explicitly.
- Attendance mutations are **not queued offline**. Check In and Check Out require immediate server confirmation.

## Leave Management

Employee leave in mobile uses the same backend workflow as the web client:

- `GET /api/v1/leave-requests/me` for authenticated employee requests (paginated).
- `POST /api/v1/leave-requests` to submit a new leave request.
- Request status values are backend-defined (`Pending`, `Approved`, `Rejected`) and shown as readable text.

Request Leave:

- Uses React Hook Form + Zod validation.
- Uses native date picker UI and serializes selected dates as date-only (`YYYY-MM-DD`) values.
- Blocks past dates in both schema validation and date-picker minimum date.
- Submits only after client validation, then waits for server confirmation.
- On success, invalidates leave queries and returns to the Leave list.

Leave list:

- Uses TanStack Query infinite pagination and pull-to-refresh.
- Shows loading, empty, error, and success states.
- Refreshing fetches latest manager/admin review status changes from the API.

Important constraints:

- Leave creation is server-authoritative (no optimistic insertion and no offline submission queue).

## Role-Aware Approvals (Phase 5)

Mobile navigation is role-aware based on the JWT role claim decoded by `AuthProvider`:

- Employee: `Home`, `Attendance`, `Leave`, `Profile`
- Manager/Admin: `Home`, `Attendance`, `Leave`, `Approvals`, `Profile`

Approvals workflow:

- `GET /api/v1/leave-requests` with `status=Pending` loads reviewable requests for authorized users.
- `PATCH /api/v1/leave-requests/{id}/approve` approves a pending request.
- `PATCH /api/v1/leave-requests/{id}/reject` rejects a pending request.
- Approval and rejection use confirmation dialogs and invalidate leave queries on success.

RBAC principle:

- Frontend role checks are UX-only (tab and screen visibility).
- Backend ASP.NET Core authorization remains the security boundary.
- Protected API `401` clears session and returns to login.
- Protected API `403` preserves session and shows permission/action errors.

## Profile (Phase 6)

Profile is implemented as authenticated self-service view with secure logout:

- Shows current authenticated `email`, `role`, and `employeeId`.
- Uses `AuthProvider` session claims as the data source because the current backend contract does not expose a dedicated non-admin self-profile endpoint.
- Uses logout confirmation before clearing session.
- Logout still clears SecureStore token, in-memory token, and protected query cache.

