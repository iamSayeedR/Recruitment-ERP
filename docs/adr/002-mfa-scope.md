# ADR 002: MFA Scope — Conditional OTP for Staff Roles

## Status
**Accepted** — 2026-08-09

## Decision Maker
Product/Engineering team decision, confirmed by project stakeholder.

## Context
The Recruitment & Mobilization ERP handles regulated PII (passports, medical results, visa data, bank details) across multiple jurisdictions (UAE PDPL, KSA PDPL, India DPDP Act, Philippines DPA, GDPR). Multi-factor authentication is a baseline security control for systems with this level of PII exposure.

The question was: which user roles should be required to complete MFA (TOTP-based conditional OTP via Keycloak) at login?

### Roles in the system
| Role | PII Access Level | Data Scope |
|------|-----------------|------------|
| `SUPER_ADMIN` | Full platform | All tenants |
| `TENANT_ADMIN` | Full tenant | All branches, all candidates |
| `BRANCH_MANAGER` | Branch-wide | All candidates in branch |
| `RECRUITER` | Broad | Candidates they work with |
| `COMPLIANCE_OFFICER` | Sensitive | Passports, medical, visa docs |
| `FINANCE_OFFICER` | Sensitive | Bank details, payment records |
| `CLIENT_USER` | Limited | Their own requisitions + shortlisted candidates |
| `CANDIDATE` | Self-only | Their own profile + application status |

## Decision

**MFA (conditional OTP) is required for all staff roles:**
- `SUPER_ADMIN`
- `TENANT_ADMIN`
- `BRANCH_MANAGER`
- `RECRUITER`
- `COMPLIANCE_OFFICER`
- `FINANCE_OFFICER`

**MFA is NOT required for:**
- `CLIENT_USER` — limited, scoped access to their own requisitions; adding MFA creates onboarding friction disproportionate to risk
- `CANDIDATE` — self-scoped access only (own profile, own application status); high-friction MFA on a mobile-first user base with varying technical literacy would hurt adoption

## Rationale
1. **Staff users have broad PII access.** Even a `RECRUITER` can view candidate passport details, medical status, and contact information. A compromised staff account is a significant breach vector.
2. **TOTP is low-friction for staff.** Staff users log in from office workstations or company-issued devices — they can set up an authenticator app once and have a 30-second code entry on each login. This is standard for enterprise SaaS handling PII.
3. **Candidates/clients have self-scoped access.** Their data exposure on a compromised account is limited to their own records. The friction-to-risk ratio doesn't justify mandatory MFA for these roles at this stage.
4. **Keycloak's conditional OTP flow** makes role-based MFA enforcement straightforward without building custom auth logic.

## Implementation
- Keycloak realm: custom browser flow `browser-with-conditional-otp` with `conditional-user-role` authenticator checking each staff role
- Group `staff-mfa-required` maps to the 6 staff roles
- Group `external-no-mfa` maps to CLIENT_USER and CANDIDATE
- OTP policy: TOTP, SHA1, 6 digits, 30-second period

## Consequences
- **Positive:** Significantly reduces risk of compromised credentials leading to PII breach for the highest-impact accounts
- **Positive:** Meets regulatory expectations for "appropriate technical measures" under PDPL/DPDP/GDPR
- **Negative:** Staff must set up TOTP on first login (one-time setup friction)
- **Negative:** Lost authenticator recovery requires admin intervention (Keycloak admin can reset OTP)
- **Future consideration:** If CLIENT_USER portals expand to include more PII (e.g., full worker profiles with documents), re-evaluate MFA for that role
