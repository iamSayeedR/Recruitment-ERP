# ADR 004: Document Malware Scanning and PII Encryption Scope

## Status
**Accepted** — 2026-08-09

## Decision Maker
Product/Engineering team decision, confirmed by project stakeholder.

## Context
The recruitment portal handles high-volume uploads of documents (e.g. passport pages, medical clearance PDFs, skills certifications) and candidate profile details.

This ADR addresses two security architecture gaps identified after the Phase 2 build:
1. **Malware Scanning**: In the development environment, document scans are mocked (`scanDocument` in `CandidateService` immediately completes without real checking). However, processing untrusted file uploads presents a high risk of malware execution or propagation.
2. **PII Encryption Scope**: The original domain model specified `passportExpiry` as encrypted PII, but it was stored as an unencrypted `DATE` in the database to simplify query/filtering logic. Leaving passport expiry dates unencrypted exposes PII and violates the privacy-by-design policy.

## Decisions

### 1. Document Scanning Blocker
- **Dev-only Mocking**: The mock scanner in `CandidateService` is strictly limited to local developer environments (`dev` profile).
- **Production Requirement**: Before any staging or production deployment handles real candidate documents, the mock scanner **must** be replaced by a real virus/malware scanning engine (e.g., ClamAV API container or cloud-native equivalents like AWS GuardDuty/VirusTotal integrations).
- **Execution Flow**:
  1. File is uploaded to MinIO/S3 with a randomized UUID key name.
  2. Status is set to `PENDING_SCAN`. The file is blocked from access/viewing by standard users.
  3. A scan job (or event listener) triggers.
  4. Upon clean scan, status is changed to `CLEAN` and the document is opened for access.
  5. If infected, status is changed to `INFECTED`, the file is quarantined/deleted, and an alert is logged.

### 2. Encryption of Passport Expiry
- **Encrypt at Rest**: The `passportExpiry` column will be encrypted at rest, matching `passportNumber` and `nationalId`.
- **Implementation**: The date is encrypted to ciphertext via `FieldEncryptionConverter.class` and persisted as a `VARCHAR(255)` string.
- **Handling Queries**: If bulk sweeps of expiring passports are required, the application will swept decrypt in memory (or store a separate non-PII `expiry_alert_date` derived date field in plaintext if bulk DB-level filtering becomes a hot path). For now, standard decryption during list fetching is sufficient.

## Rationale
- Compliance with **OWASP ASVS Level 3** requirements for file uploads.
- Adherence to data privacy rules (UAE PDPL, KSA PDPL, GDPR) requiring all identifiable passport indicators to be encrypted at rest.

## Consequences
- **Positive**: Strict protection against malware uploads and unauthorized PII visibility.
- **Negative**: Increased storage size for the expiry column due to encryption overhead.
- **Negative**: Expiry scans cannot be queried using simple DB date-range comparisons on `passport_expiry` directly.
