-- V1__create_iam_tables.sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    subscription_plan VARCHAR(100),
    data_retention_days INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE branches (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE clients (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    country VARCHAR(100),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE client_contracts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    start_date DATE,
    end_date DATE,
    terms TEXT,
    status VARCHAR(50) NOT NULL,
    contract_value NUMERIC(19, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    keycloak_user_id VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
