# ADR 003: Frontend Authentication — NextAuth.js with Keycloak Provider

## Status
**Accepted** — 2026-08-09

## Context
The frontend needs to authenticate users via the Keycloak OIDC provider configured in ADR 001/002. Two main approaches were evaluated:

### Option A: NextAuth.js with Keycloak Provider
- Mature Next.js-native auth library with App Router support
- Built-in session management, CSRF protection, JWT/session callbacks
- Server-side session via httpOnly cookies (aligns with §2.3 security requirement)
- Handles token refresh transparently
- Large ecosystem and community support

### Option B: Keycloak JS Adapter (`keycloak-js`)
- Official Keycloak client library
- Stores tokens in localStorage by default (violates §2.3 — "no sensitive tokens in localStorage")
- Requires significant custom wrapper to use httpOnly cookies instead
- Better for SPAs without a server component; less natural fit for Next.js App Router with server components
- Tighter coupling to Keycloak-specific features

## Decision
**NextAuth.js v5 (Auth.js) with the Keycloak OIDC provider.**

## Rationale
1. **Security compliance (§2.3):** NextAuth.js stores the session in an httpOnly, Secure, SameSite=Strict cookie by default. The access token is held server-side in the session, never exposed to the browser's JavaScript context. This directly satisfies the engineering prompt's non-negotiable requirement: "No sensitive tokens in localStorage."
2. **App Router native:** NextAuth.js v5 has first-class support for Next.js App Router, including middleware-based route protection and server component session access.
3. **Token refresh:** NextAuth.js handles refresh token rotation via its `jwt` callback, which aligns with the Keycloak realm's `revokeRefreshToken: true` + `refreshTokenMaxReuse: 0` configuration.
4. **Reduced custom code:** Using keycloak-js with httpOnly cookies would require building a custom BFF (backend-for-frontend) token proxy — NextAuth.js provides this out of the box.

## Implementation
- `next-auth` v5 with `@auth/core` Keycloak provider
- Session strategy: `jwt` (encrypted in httpOnly cookie)
- JWT callback: extracts `tenant_id`, `branch_id`, `roles` from the Keycloak ID token and stores them in the NextAuth session
- Session callback: exposes `tenantId`, `branchId`, `roles` to the client via `useSession()`
- Middleware: protects all routes under `/(dashboard)` layout group, redirects unauthenticated users to Keycloak login
- Access token forwarded to backend API calls via server-side route handlers (never sent to browser)
- MFA step handled entirely by Keycloak's browser flow — NextAuth.js redirects to Keycloak, user completes password + OTP, Keycloak redirects back with auth code

## Consequences
- **Positive:** Clean security model — access token never touches browser JS
- **Positive:** Server components can access session directly
- **Positive:** Standard, well-maintained library with active security patches
- **Negative:** Slight vendor coupling to NextAuth.js patterns
- **Negative:** Custom Keycloak admin operations (user creation, role assignment) still require direct Keycloak Admin API calls from the backend, not through NextAuth
