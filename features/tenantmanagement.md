# 🚀 Feature Request: Multi-Tenant Administration for MWAP

## 📍 Context

You are contributing to the **MWAP (Modular Web Application Platform)**. The project is a full-stack application using:

- **Frontend**: React + TypeScript + Mantine UI
- **Backend**: Node.js + Express + MongoDB
- **Auth**: Auth0 (fully integrated)
- **Hosting**: Heroku
- **Branch**: Create all changes in a new feature branch called `tenantadmin`

The authentication layer is powered by Auth0 (SPA with PKCE), and the app is currently deployed to staging and production via Heroku with MongoDB Atlas as the backend. Avoid creating code for functionality that is already offered in the existing platforms used by MWAP (Auht0, Heroku, MongoDB)

## 🆕 Feature Name: Administration

### 🎯 Goal
Implement an administration system for **multi-tenant user and tenant management**, used by super administrators and tenant owners.

---

## 📘 User Stories to Implement

### 🧑‍💻 As a new user:
- After completing Auth0 signup, I want to create a tenant by submitting a name.
- Once submitted, the tenant is marked for `Review` and flagged for superadmin approval.

### 📧 As a user:
- I receive an email when my tenant is approved.
- I cannot access the app until approval.
- When logging in before approval, I see a message:  
  `"Your tenant is under review (X days since submission)"`.

---

### 🧑‍💼 As a Super Admin:
- I see a list of pending tenants and their owning users.
- I can approve or reject tenant requests.
- I see all existing tenants with:
  - Creation date
  - Owning user
  - Participating users
- In tenant details, I can change tenant status to:
  - `Review` | `Active` | `Archived`

---

### 🧑 As a Tenant Owner:
- I can change my tenant's status to:
  - `Active` | `Archived`
- I can delete my tenant with a single action (confirmation required).

---

## 🔐 Authentication Integration (Use Existing Auth0 Setup)
- Use the Auth0 `sub` as the user's unique ID.
- Do NOT build your own authentication logic.
- Authorization (tenant access, roles, etc.) should be managed in MongoDB.

---

## 🧱 Technical Implementation

### MongoDB Models
- `Tenant`: { id, name, status, createdAt, createdBy, members: [userId] }
- `User`: Extend schema with:
  - `auth0Id`, `email`, `globalRoles`, and `tenants` (array of membership + role)

### Roles and Permissions
- Global: `super_admin`
- Per-tenant: `owner`, `admin`, `editor`, `user`
- Only `super_admin` can manage all tenants
- Only `owner` can manage their own tenant

---

## 🖥 UI
- **Admin Panel** (only for `super_admin`):
  - List new tenants
  - Approve/reject requests
  - View/edit tenant details

- **Tenant Dashboard**:
  - Show status messages to users
  - Allow owners to archive or delete

---

## ✉️ Email Notification (optional)
- Send email via a backend API (or webhook) to notify users of approval

---

## ⚙️ Requirements

- Follow modular architecture — services, controllers, routes
- Protect routes using existing Auth0 middleware
- Scope all tenant queries by role
- Ensure all new features are in the `tenantadmin` branch
- Add sample API usage or minimal frontend pages if relevant

---

## ✅ Output

- Backend: Models, routes, services, and protected endpoints
- Frontend: Minimal views for user/tenant admin dashboard
- Markdown summary of API endpoints
- Code must integrate with existing MWAP codebase

Begin building this feature.
