CREATE TABLE requisitions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    client_id UUID,
    branch_id UUID,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    job_category VARCHAR(50),
    destination_country VARCHAR(100),
    positions_required INT NOT NULL CHECK (positions_required >= 1),
    positions_filled INT NOT NULL DEFAULT 0 CHECK (positions_filled >= 0),
    salary_range VARCHAR(100),
    benefits TEXT,
    contract_duration INT,
    required_skills TEXT,
    required_certifications TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    approved_by VARCHAR(100),
    approval_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE requisition_status_history (
    requisition_id UUID NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Enable RLS
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions FORCE ROW LEVEL SECURITY;
ALTER TABLE requisition_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisition_status_history FORCE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation_policy ON requisitions
    USING (tenant_id = current_setting('app.current_tenant_id'));

CREATE POLICY tenant_isolation_policy_history ON requisition_status_history
    USING (requisition_id IN (SELECT id FROM requisitions WHERE tenant_id = current_setting('app.current_tenant_id')));

-- Create trigger for audit fields updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_requisitions_updated_at
    BEFORE UPDATE ON requisitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
