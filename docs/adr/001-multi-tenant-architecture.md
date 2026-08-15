# Architecture Decision Record

## Title: Multi-Tenant Data Isolation Strategy

## Status: Accepted

## Context
The Recruitment & Mobilization ERP operates as a SaaS platform where multiple organizations (tenants) share the same underlying infrastructure. We need a robust strategy to isolate tenant data to prevent data leakage across tenants while keeping infrastructure costs manageable and operations simple. 

## Decision
We have decided to adopt a **defense-in-depth approach** using a shared-database, shared-schema model. 
Data isolation will be enforced at two layers:
1. **Application Layer:** Hibernate `@Filter` will be applied globally to append `tenant_id = ?` to all relevant queries automatically.
2. **Database Layer:** PostgreSQL Row-Level Security (RLS) policies will be configured to restrict access based on the current session's tenant context.

## Consequences

### Pros
- **Cost-effective:** Allows maximizing resource utilization by sharing a single database instance and schema.
- **Simplified Migrations:** Schema changes only need to be applied once, not per tenant.
- **Strong Security:** RLS acts as a safety net at the database level, ensuring that even if an application bug bypasses the Hibernate filter, data remains isolated.

### Cons
- **Performance Overhead:** RLS policies and mandatory `tenant_id` filtering add slight overhead to query execution.
- **Complexity in Maintenance:** Requires setting up database session variables securely before executing queries, which complicates connection pooling (requires specific Hibernate Session/Connection management).
- **No Per-Tenant Restore:** Restoring data for a single tenant from a database backup is significantly harder than in a database-per-tenant model.
