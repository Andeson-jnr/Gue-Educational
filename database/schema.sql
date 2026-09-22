CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    head_of_department VARCHAR(255),
    description TEXT
);

CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(100) PRIMARY KEY,
    department_id VARCHAR(100) NOT NULL REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(100) PRIMARY KEY,
    staff_id VARCHAR(100) NOT NULL UNIQUE,

    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,

    gender VARCHAR(30),
    date_of_birth DATE,
    photo_url TEXT,

    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,

    designation VARCHAR(255),

    department_id VARCHAR(100)
        REFERENCES departments(id),

    unit_id VARCHAR(100)
        REFERENCES units(id),

    employment_type VARCHAR(50),
    employment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',

    date_of_appointment DATE,
    supervisor VARCHAR(255),
    institution VARCHAR(255),
    staff_category VARCHAR(100),

    highest_qualification TEXT,
    certifications TEXT,
    specialisation TEXT,

    employee_number VARCHAR(100),
    appointment_ref VARCHAR(255),

    created_by VARCHAR(255),

    status_change_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    id VARCHAR(100) PRIMARY KEY,
    staff_id VARCHAR(100) NOT NULL REFERENCES staff(id),
    token VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_by VARCHAR(255),
    revocation_reason TEXT,
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS verification_logs (
    id VARCHAR(100) PRIMARY KEY,
    verification_token VARCHAR(100),
    staff_id VARCHAR(100),
    staff_name VARCHAR(255),
    department VARCHAR(255),
    status_result VARCHAR(50),
    ip_address VARCHAR(100),
    user_agent TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    admin_id VARCHAR(100),
    admin_name VARCHAR(255),
    admin_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    previous_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_documents (
    id VARCHAR(100) PRIMARY KEY,
    staff_id VARCHAR(100) NOT NULL REFERENCES staff(id),
    document_type VARCHAR(100),
    file_name VARCHAR(255),
    file_url TEXT,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,

    org_name VARCHAR(255),
    org_rc VARCHAR(100),
    org_tin VARCHAR(100),
    training_centre_name VARCHAR(255),

    address TEXT,
    phone TEXT,
    email VARCHAR(255),
    website TEXT,

    verification_base_url TEXT,
    staff_id_prefix VARCHAR(20),

    card_primary_color VARCHAR(20),
    card_accent_color VARCHAR(20),
    card_footer_notice TEXT,
    logo_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_staff_staff_id
ON staff(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_department
ON staff(department_id);

CREATE INDEX IF NOT EXISTS idx_staff_status
ON staff(employment_status);

CREATE INDEX IF NOT EXISTS idx_staff_email
ON staff(email);

CREATE INDEX IF NOT EXISTS idx_verification_token
ON verification_tokens(token);

CREATE INDEX IF NOT EXISTS idx_verification_staff
ON verification_tokens(staff_id);

CREATE INDEX IF NOT EXISTS idx_verification_logs_date
ON verification_logs(verified_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_date
ON audit_logs(timestamp);
