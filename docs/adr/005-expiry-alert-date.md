# ADR 005: Expiry-Sweep Query Path for Encrypted Date Fields

## Context

Several compliance features (e.g. passport validity sweeps, visa expiration checks, medical attestation reviews) require the system to perform automated periodic sweeps to find records expiring within a configurable window (e.g., 30/15/7 days out). 
Since sensitive date fields like `passportExpiry` must be encrypted using `LocalDateEncryptionConverter` (resulting in a database column of type `VARCHAR(255)` storing Base64 ciphertext), direct SQL queries with a `WHERE ... BETWEEN` or `WHERE ... < ...` comparison are impossible. Doing a full-table fetch and decrypting all rows in the application layer would not scale.

## Decision

We will add a separate, non-PII derived date column to store the plain date (`DATE` type in PostgreSQL) alongside the encrypted date field.

1. **Plaintext Derived Column**: A plain `expiry_alert_date` column is added to the table. In isolation, a date (without name or passport number in the same column) does not constitute sensitive PII.
2. **Indexing**: The derived column is indexed (`CREATE INDEX`) to support fast query performance for sweeps and alerts.
3. **Synchronization**: The derived column is kept in sync with the primary encrypted field using:
   - Entity setters.
   - JPA lifecycle hooks (`@PrePersist` and `@PreUpdate`) on the entity to guarantee database-level consistency regardless of write-path framework details.
4. **Consistency**: All future compliance elements (e.g. visa expiry, health attestations) must follow this exact derived column pattern.

## Status

**Accepted**
