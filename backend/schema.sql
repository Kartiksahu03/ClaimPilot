-- ClaimPilot database schema
-- Run this script in the Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claimant_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    user_type VARCHAR(30) NOT NULL
        CHECK (user_type IN ('Patient', 'Caregiver', 'Hospital Representative')),
    claim_category VARCHAR(40) NOT NULL
        CHECK (claim_category IN ('Hospitalization', 'Daycare', 'Pre/Post Hospitalization', 'Other')),
    policy_number VARCHAR(100),
    claim_amount NUMERIC(12, 2),
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Submitted'
        CHECK (status IN ('Submitted', 'Under Review', 'Needs Information', 'Ready for Review', 'Closed')),
    ai_summary TEXT,
    ai_extracted_data JSONB,
    ai_review_notes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claim_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    original_file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    document_type VARCHAR(80),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claim_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_category ON claims(claim_category);
CREATE INDEX IF NOT EXISTS idx_claims_user_type ON claims(user_type);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_documents_claim_id ON claim_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_activity_logs_claim_id ON claim_activity_logs(claim_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS claims_set_updated_at ON claims;

CREATE TRIGGER claims_set_updated_at
BEFORE UPDATE ON claims
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
