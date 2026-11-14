# Dependency Security Remediation

**Date:** 2026-11-11  
**Repository:** isaacokubi/hussein-mboya-tours

## Applied lockfile remediation

### Server

- Updated the locked Mongoose release to **8.24.8**, beyond the affected Mongoose 8.24.7 advisory boundary.
- Pinned the development-only Nodemon range to **3.1.11** to remove the reported Nodemon/minimatch advisory chain.
- Preserved existing application dependency ranges where compatible patched releases were available.

### Client

- Aligned ESLint and @eslint/js to **9.39.5**; the lint configuration and current React plugins pass on this major line.
- Removed unused development dependencies: depcheck, vite-plugin-pwa, and workbox-build. Repository inspection confirmed none is imported by the Vite configuration or client source; the app does not currently register a PWA plugin or Workbox service worker.
- Regenerated the client lockfile without those unused dependency trees.

## Verification

The isolated remediation workflow performed the changes against fresh checkouts, then ran:

- Server npm audit: **0 vulnerabilities**.
- Client npm audit: **0 vulnerabilities**.
- Server npm ci, npm run check:all, and npm test: passed.
- Client npm ci, npm run lint, and npm run build: passed.

The dependency-audit workflow now fails if either lockfile reports any remaining vulnerability. Exact audit reports are retained as GitHub Actions artifacts.

## Scope

These changes affect dependency manifests and lockfiles only. No production database records, payment records, tenant data, or provider credentials were changed.