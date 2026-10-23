# Production Launch Hardening: Auth Verification, Demo Account Purge & clickcamp.site Migration

Comprehensive plan to transition Click Camp Technologies from testing/demo mode to an enterprise production-grade portal. This involves stripping demo helper buttons from the login UI, purging all demo accounts except Super Admin, enforcing strict password authentication with denial on mismatch, and re-routing all corporate identities and password reset links through `clickcamp.site`.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during interactive clarification and form the baseline for execution:
> - **Demo Profile Handling**: Purge all mock demo accounts (Rahul Verma, Priya Nambiar, Rohan Gupta, Vikram Malhotra, Ananya Sharma) from the employee directory and login portal, retaining only the authentic Super Admin profile (Adnan Malik).
> - **Authentication Mode**: Implement strict password matching in both standalone and database modes. Any credential mismatch will be rejected with an authentication failure.
> - **Corporate Identity**: Migrate all corporate email references from `clickcamp.tech` to `clickcamp.site`. The Super Admin primary address will be `adnan.malik@clickcamp.site`, with backwards-compatible alias authentication for `adnanmaliklyx@gmail.com`.

---

## 1. Overview & Core Concept

- **What It Delivers**: 
  1. A hardened, production-only login portal with no public test shortcuts or exposed demo credentials.
  2. Strict server-grade authentication logic in `AuthService` and `LoginPortal` that verifies credentials against stored records and rejects any incorrect password attempt with audit logging.
  3. Sanitized employee directory initialized with the verified Super Admin account, ready for onboarding real personnel.
  4. Unified corporate identity across the platform, standardizing email routing, new hire email generation, webmail templates, and password reset flows to `clickcamp.site`.
- **Target Audience**: Real employees, operations associates, HR leads, and executive directors onboarding into the live production environment.
- **Key Value**: Eradicates security vulnerabilities stemming from testing shortcuts, prevents unauthorized access, and aligns all branding and communication channels to the production domain.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Corporate Login**:
   - User arrives at `https://clickcamp.site/` or the secure portal.
   - Clean, focused credential form with `name@clickcamp.site` placeholder and no test pills or shortcuts.
   - User inputs email and password.
   - If incorrect: Instant, clear error banner (`Invalid corporate credentials. Please verify your work email and password.`) with security audit trail entry.
   - If correct: Transitions smoothly to 2FA verification (or directly into authorized workspace).
2. **Password Recovery**:
   - User clicks *"Forgot password?"*.
   - Inputs corporate email (`user@clickcamp.site`).
   - System dispatches a cryptographically signed password reset link routed via `https://clickcamp.site/reset-password?token=...`.
3. **Employee Directory & Onboarding**:
   - Admin view displays authentic personnel only (starting clean with Adnan Malik as Super Admin).
   - Newly provisioned staff automatically receive `@clickcamp.site` work emails and unique initial passwords.

### Visual Identity & Layout
- **Style Direction**: High-density cyber-enterprise interface with neutral dark canvas (`#070b0e`), slate structural containers (`#0f172a`), hairline borders (`rgba(255,255,255,0.08)`), and emerald primary accents (`#10b981`).
- **Typography**: Clean sans (`Plus Jakarta Sans` / modern system sans) with tabular monospace figures (`font-mono tabular-nums`) for timestamps, audit logs, and security tokens.
- **Form Polish**: Zero-pill metadata discipline, visible focus rings, and high-visibility accessible error states.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Elimination of Quick Test Profiles**
  - *Chosen Approach*: Completely remove the Quick Test Profiles grid from `LoginPortal.tsx`.
  - *Why*: In a production app for real employees, public test account shortcuts expose credentials and undermine workplace compliance.
  - *Alternative Considered*: Hiding them behind an environment variable (`NODE_ENV === 'development'`). Rejected in favor of total removal to prevent production leaks.

- **Decision 2: Strict Standalone Directory Password Verification**
  - *Chosen Approach*: Enforce exact matching against stored employee password hashes/records (`target.initialPassword` or persistent credentials) in `AuthService.signInWithEmailPassword`. If the password does not match, return `success: false` with an explicit error.
  - *Why*: Eliminates the permissive fallback that previously accepted any 6-character string.

- **Decision 3: Domain Re-Routing to `clickcamp.site`**
  - *Chosen Approach*: Global replacement of `clickcamp.tech` with `clickcamp.site` across `mockData.ts`, `authService.ts`, `WorkspaceContext.tsx`, `EmployeeManagementPanel.tsx`, `AdminWorkspace.tsx`, and `OnboardingPortal.tsx`.
  - *Why*: Matches the user's official domain for email routing, MX records, and password recovery.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ClickCamp Technologies Production Portal             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────┐               ┌────────────────────────┐  │
│  │    LoginPortal.tsx      │               │   OnboardingPortal     │  │
│  │  - Single Credential Box│               │  - Creates real staff  │  │
│  │  - Zero Test Shortcuts  │               │  - @clickcamp.site     │  │
│  └────────────┬────────────┘               └───────────┬────────────┘  │
│               │                                        │               │
│               ▼                                        ▼               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        AuthService.ts                            │  │
│  │  - signInWithEmailPassword (Strict Password Verification)        │  │
│  │  - requestPasswordReset (https://clickcamp.site/reset-password)   │  │
│  │  - getSession / saveLocalSession                                 │  │
│  └────────────────────────────┬─────────────────────────────────────┘  │
│                               │                                        │
│               ┌───────────────┴───────────────┐                        │
│               ▼                               ▼                        │
│  ┌────────────────────────┐       ┌───────────────────────────────┐    │
│  │ Supabase Auth (DB Mode)│       │ Directory Auth (Stand-alone)  │    │
│  │ - Production schema    │       │ - Exact password match check  │    │
│  │ - Real employee table  │       │ - Suspended / Terminated gate │    │
│  └────────────────────────┘       └───────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Implementation Steps

1. **`src/components/auth/LoginPortal.tsx`**:
   - Remove lines 322–355 (Quick-Fill Helper Pills and "Quick Test Profiles" buttons).
   - Remove unused test helper `handleQuickFill`.
   - Update input placeholders from `name@clickcamp.tech` to `name@clickcamp.site`.

2. **`src/lib/authService.ts`**:
   - Hardened `signInWithEmailPassword`:
     - Compare input password against target user's configured password (`initialPassword` or stored credential).
     - Deny access with a secure error message if credentials do not match.
     - Add brute-force defense (lockout counter for 5 failed attempts per IP/session).
   - Update `requestPasswordReset` redirect URL and dispatch message to use `https://clickcamp.site/reset-password`.

3. **`src/data/mockData.ts` & `src/context/WorkspaceContext.tsx`**:
   - Purge demo employees (`Rahul Verma`, `Priya Nambiar`, `Rohan Gupta`, `Vikram Malhotra`, `Ananya Sharma`) from the initial active directory.
   - Retain Super Admin `Adnan Malik` with primary email `adnan.malik@clickcamp.site` and alias mapping for `adnanmaliklyx@gmail.com`.
   - Update default webmail samples, support tickets, and system notices to use `@clickcamp.site`.

4. **Directory Management & Onboarding**:
   - Update default email generation in `EmployeeManagementPanel.tsx`, `AdminWorkspace.tsx`, and `OnboardingPortal.tsx` to automatically suffix new accounts with `@clickcamp.site`.

5. **Verification & Audit**:
   - Run compilation and lint checks (`compile_applet`, `lint_applet`).
   - Validate negative test cases: incorrect password must be strictly rejected; valid Super Admin password must succeed.
