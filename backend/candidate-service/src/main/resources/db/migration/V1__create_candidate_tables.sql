CREATE TABLE candidates (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    nationality VARCHAR(100),
    date_of_birth DATE,
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    passport_number VARCHAR(255),
    national_id VARCHAR(255),
    passport_expiry DATE,
    skills TEXT,
    certifications TEXT,
    work_experience TEXT,
    source VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
CREATE TABLE candidate_documents (
    id UUID PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id),
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    s3_key VARCHAR(500),
    status VARCHAR(50),
    uploaded_at TIMESTAMP,
    uploaded_by VARCHAR(100)
);
CREATE TABLE candidate_applications (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    candidate_id UUID NOT NULL,
    requisition_id UUID NOT NULL,
    status VARCHAR(50),
    interview_notes TEXT,
    offered_salary DECIMAL(10,2),
    start_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON candidates
    USING (tenant_id = current_setting('app.current_tenant_id'));
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_applications FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy_apps ON candidate_applications
    USING (tenant_id = current_setting('app.current_tenant_id'));
