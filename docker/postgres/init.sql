-- Create application user with restricted privileges
-- This user should be used by the backend services to connect to the DB
CREATE USER app_user WITH PASSWORD 'app_password_change_me';

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Row-Level Security helper function
-- This function reads the current tenant_id set via SET LOCAL for the session
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS TEXT AS $$
  SELECT current_setting('app.current_tenant_id', true);
$$ LANGUAGE SQL STABLE;

-- Audit trigger function for automatic timestamps and actor tracking  
CREATE OR REPLACE FUNCTION update_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- updated_by is set by the application layer via SET LOCAL
  NEW.updated_by = current_setting('app.current_user_id', true);
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = COALESCE(NEW.created_at, NOW());
    NEW.created_by = COALESCE(NEW.created_by, current_setting('app.current_user_id', true));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Template for RLS policy (to be applied to each table by Liquibase/Flyway)
/*
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON table_name
  USING (tenant_id = current_tenant_id());
*/

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
