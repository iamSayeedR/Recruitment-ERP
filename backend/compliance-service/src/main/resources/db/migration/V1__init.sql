CREATE TABLE compliance_rules (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    destination_country VARCHAR(100),
    source_country VARCHAR(100),
    job_category VARCHAR(100),
    document_type VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL,
    validity_period_days INT,
    validation_rules JSONB,
    stage_required_by INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE compliance_checklists (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    candidate_application_id UUID NOT NULL
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY,
    checklist_id UUID NOT NULL REFERENCES compliance_checklists(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES compliance_rules(id),
    status VARCHAR(50) NOT NULL,
    document_reference VARCHAR(255),
    verified_by VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    notes TEXT,
    stage_required_by INT
);

-- Enable RLS
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules FORCE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists FORCE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items FORCE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation_policy ON compliance_rules
    USING (tenant_id = current_setting('app.current_tenant_id'));

CREATE POLICY tenant_isolation_policy_checklists ON compliance_checklists
    USING (tenant_id = current_setting('app.current_tenant_id'));

CREATE POLICY tenant_isolation_policy_items ON checklist_items
    USING (checklist_id IN (SELECT id FROM compliance_checklists WHERE tenant_id = current_setting('app.current_tenant_id')));

CREATE TABLE shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMP WITH TIME ZONE NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);
