# MWAP Coding Standards & ESM Guidelines (Updated)

Version: 2.0 | April 2025  
Approved by: Security Architect | Lead Developer

---

# 1. Module System

- Use native **ECMAScript Modules (ESM)**.
- Always use `import`/`export` syntax.
- **Do not use** `require`, `module.exports`, or CommonJS modules.
- If importing `.ts` files internally, **omit extensions**.
- Add `.js` extensions **only** when importing **compiled output** files at runtime.

---

# 2. Environment Variables

- **Primary Source**: **Heroku Config Vars**
- **Secrets Rotation**: **HashiCorp Vault** integration planned with 6-hour TTL secrets (Q2 2025).
- **Do not use** `.env` files or dotenv in any environment.
- **Access environment variables** through `process.env`, typed via `config/environment.ts`.

## Example:
```typescript
export const config = {
  auth0Domain: process.env.AUTH0_DOMAIN!,
  auth0ClientId: process.env.AUTH0_CLIENT_ID!,
  mongoUri: process.env.MONGO_URI!,
};
```

> Future Vault implementation will dynamically inject secrets into Heroku Config Vars at runtime.

---

# 3. TypeScript Standards

- Use `.ts` and `.tsx` files exclusively.
- Enable strict mode (`strict: true`) and `noImplicitAny`.
- Always type:
  - Express handlers (use `Request`, `Response` types)
  - Database models
  - Service responses
  - Middleware functions
- Avoid implicit `any` types.

---

# 4. File Structure

- One **logical unit** per file (e.g., `auth.ts`, `db.ts`, `userRoutes.ts`).
- Use **feature-based folder structure** (Auth, Tenant, Projects, Invites).
- **No mixing** `.js` and `.ts` in the same folder.
- Remove any redundant `.js` files after TypeScript migration.

---

# 5. Build & Runtime

- Compile with `tsc` using:
  - `module: "ESNext"`
  - `moduleResolution: "NodeNext"`
- Use `ts-node-esm` in dev and staging if direct execution needed.
- Enable `sourceMap` for non-production builds.
- **Production on Heroku**:
  - Use precompiled output from `/dist`.
  - Ensure `NODE_ENV=production`.

---

# 6. Secrets Management Policy

| Environment | Secrets Source |
|:--|:--|
| Development | Direct Heroku Config Vars |
| Staging | Heroku Config Vars + Vault Pilot |
| Production | Vault (dynamic injection into Heroku) |

## Future Vault Roadmap:
- Implement Vault Agent Sidecar for dynamic secrets.
- Integrate database credentials rotation.
- TTL rotation every 6 hours.

---

# 7. Code Quality Standards

- Linting: **ESLint** + **Prettier** integration.
- Mandatory type checks before any deployment (`tsc --noEmit`).
- GitHub Actions CI/CD must:
  - Run type checks
  - Run linter
  - Run security scans (OWASP ZAP, Snyk)

## Example GitHub Actions Steps
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Type check
        run: tsc --noEmit
      - name: Lint
        run: npm run lint
```

---

# 8. Security Practices

- Always validate JWTs using RS256 asymmetric encryption.
- Use JWKS (JSON Web Key Sets) endpoint validation.
- Implement strict CORS policies.
- Add security headers via Helmet.
- Perform dependency scans before each release.
- Plan for JWT Replay protection using `jti` claims in future iterations.

---

# 9. Documentation Requirements

- Update `docs/architecture/overview.md` whenever architecture changes.
- Document new features or major refactors with example code.
- Add API documentation for new routes.
- Maintain strict version history and changelog discipline.

---

# 🌐 Conclusion

By adhering to these updated MWAP Coding Standards, the platform will maintain high reliability, type safety, security compliance, and a strong foundation for future scalability and multi-region deployment.

#LetsBuildSecurely 🔑

