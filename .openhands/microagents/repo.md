# MWAP Repository Microagent Guide

## 🛠 Project Overview
MWAP (Modular Web Application Platform) is a fullstack, secure, scalable SaaS framework built with:
- **Frontend**: React 18 + Vite + Mantine
- **Backend**: Node.js (ESM) + Express + MongoDB Atlas
- **Authentication**: Auth0 (PKCE, MFA, approval flow)
- **Storage**: Dropbox, Google Drive, Box, OneDrive (multi-provider)
- **Hosting**: Heroku Standard-2X Dynos
- **CI/CD**: GitHub Actions

It supports **multi-tenant management**, **cloud integration**, **project-based roles**, and **PWA** standards.

## ✍ Prompting Best Practices
For OpenHands AI (Claude 3.5):
- **Minimal inputs** only, no verbosity
- Use structure:
  ```
  Task: <action>
  Context: <high-level background>
  Requirements:
    - Bullet
    - Specific
  ```
- **One task per prompt**: atomic focus
- **Use code comments** to guide outputs
- **Ask for code-only responses**, no explanations

## 🏩 Architecture Principles
- **API Gateway** with Express.js and NGINX
- **JWT authentication** with RS256 + JWKS endpoint validation
- **Strict Zero Trust model** for APIs and storage
- **Progressive enhancement**: Cloud providers, project types, OAuth handled dynamically
- **Security-first**: Helmet headers, CORS, OWASP ZAP tested

## 🔥 Coding Standards
- **TypeScript-first**: `strict: true`, no implicit `any`
- **Native ESM** modules only
- **Heroku Config Vars** for secrets (Vault rollout in progress)
- **One logical feature per file/folder** (auth, tenant, projects)
- **Centralized error handling** via `AppError`
- **Mandatory** GitHub CI checks: lint, typecheck, security scan

## 📚 Core Functional Domains
- **Tenant Management**:
  - One user = One tenant
  - Invite-only project membership
  - Tenant owners can rename, archive
- **Project Management**:
  - Projects link 1:1 with cloud storage folders
  - Admin, Deputy, Contributor roles
- **Superadmin Functions**:
  - View/manage tenants, projects
  - Manage available cloud providers and project types

## 🛡️ Security and Compliance
- **GDPR-first** data practices
- **MongoDB Field-Level Encryption**
- **Rate limiting** on all APIs
- **Heroku Preboot** dynos for uptime guarantees
- **Auth0 MFA and OAuth callback protection**

## 🧹 Codebase Organization
- **Client (React)**: Components, Hooks, Pages
- **Server (Express)**: Routes, Controllers, Services
- **Docs**: API specifications, architecture diagrams
- **Scripts**: Heroku build/deploy automation

Monorepo Structure:
```
client/   → Frontend
server/   → Backend
docs/     → API + Architecture
scripts/  → CI/CD build tools
```

## 🔎 Repository Behavior
- Follow **feature folder structure** rigidly
- Clean imports (no deep relative hell like `../../../`)
- No `.env` usage — all env vars injected from Heroku
- Frontend uses **Mantine** for UI + Forms + Modals
- Backend uses **typed Express routes** and **rate-limited APIs**

## 🔧 API Schema Practices
- **Strict request validation** at controller entry
- **Consistent success/error response format**
- OpenAPI schemas kept updated

## 🧐 Key Strategic Lessons
- Start with minimal, type-safe MVP
- Avoid complexity until needed (Vault, Mesh after MVP)
- Prompt OpenHands agents with focused tasks to maximize output quality

---

# #LetsBuildSecurely 🚀

