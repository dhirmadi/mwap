# MWAP Repository Microagent Guide (repo.md)

This file defines project-wide standards, architectural decisions, coding guidelines, and reusability principles that all Claude prompts and OpenHands microagents must adhere to.

---

## 🧭 Project Purpose

**MWAP (Modular Web Application Platform)** is a secure, multi-tenant SaaS starter kit that enables users to manage cloud-integrated projects across different providers (Google Drive, Dropbox, OneDrive, Box). It features tenant/project/user roles, OAuth integrations, and structured role-based access.

---

## 🗂️ Project Structure Overview

- **Client**: `client/src/` - React 18 app with Vite, TypeScript, Mantine UI
- **Server**: `server/src/` - Node.js + Express backend with modular routing
- **Docs**: `docs/` - Architecture, standards, and API documentation

Each feature (tenant, project, auth, invite) follows a **feature-first modular structure**:
```
features/<feature>/
├── controllers/
├── routes/
├── schemas/
├── types/
```

---

## 💡 Coding Standards

All backend and frontend code must:

- Be written in **TypeScript**
- Use `AppError`, `logger`, and `SuccessResponse` for error/logging/output patterns
- Validate input using **Zod schemas**
- Use **strict typing** with no `any`
- Structure responses using shared `ApiResponse<T>` types
- Follow consistent file layout and naming conventions

---

## 🔁 DRY Principle (Do Not Repeat Yourself)

Before creating new code, check:

- ✅ Is there an existing **hook**, **schema**, **type**, or **middleware** for this?
- ✅ Reuse **shared types** from `/core/types` or `/features/<module>/types`
- ✅ Reuse **controller patterns** (e.g., logging, auth checks, Zod validation)
- ✅ Avoid duplicating `.env` keys, config parsing, or middleware logic

If a Claude prompt duplicates logic, correct it to re-use what exists.

---

## 🔒 Security Requirements

- All routes are protected by Auth0 JWT middleware (`auth.validateToken`)
- Tenant/project actions must be authorized with `requireTenantOwner` or `requireProjectRole`
- All cloud providers are authenticated via OAuth2 and linked per-tenant
- Tokens are stored encrypted (MongoDB or Vault)
- Shared folders, tokens, and metadata must be scoped by tenant
- **Never generate logic that bypasses role checks**

---

## 🧱 UI & Hook Conventions

- All React components are functional, typed, and live in `components/`
- All React hooks live in `hooks/` (e.g. `useTenant`, `useProjects`)
- Use **SWR or React Query** for all API access
- Forms use **Mantine form components**
- Errors are rendered using `ErrorDisplay`, loading states use `LoadingState`

---

## ⚙️ Integration Standards

Cloud integrations (Google, Dropbox, etc.) must:

- Authenticate via OAuth2 callback in `/api/v1/auth/:provider/callback`
- Be stored on the tenant model in `tenant.integrations[]`
- Support folder browsing via service wrappers (e.g., `DropboxService`)
- Never allow folder access without active integration tokens
- Follow consistent interface signatures across providers

---

## 📦 Deployment & CI

- Heroku used for staging (`eco` dynos); consider Railway for production
- Vite used for build process
- Scripts live in `scripts/` and auto-generate `.env` from Heroku
- Docker support is optional (future work)

---

## ✅ Summary

| Principle      | What It Means                                  |
|----------------|-------------------------------------------------|
| **DRY**        | Always reuse existing types, hooks, logic       |
| **Type-Safe**  | All code must compile under strict TS           |
| **Secure**     | Never skip middleware or token validation       |
| **Consistent** | Use shared patterns and naming conventions      |
| **Lean**       | Avoid memory-heavy libs or unscoped logic       |

---

Microagents should **anchor to this file** when operating over tickets to ensure Claude works within the boundaries of the project. Use this to summarize project rules in prompt chains.