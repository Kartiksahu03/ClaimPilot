-- ClaimPilot Step 9: reviewer comments, status, and activity history
CREATE TABLE IF NOT EXISTS claim_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  event_type VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  reviewer_name VARCHAR(150) NOT NULL DEFAULT 'Demo Reviewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claim_activity_logs_claim_created ON claim_activity_logs (claim_id, created_at DESC);

CREATE TABLE IF NOT EXISTS claim_reviewer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  note TEXT NOT NULL CHECK (length(trim(note)) BETWEEN 1 AND 3000),
  reviewer_name VARCHAR(150) NOT NULL DEFAULT 'Demo Reviewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claim_reviewer_notes_claim_created ON claim_reviewer_notes (claim_id, created_at DESC);

ALTER TABLE claims ADD COLUMN IF NOT EXISTS review_status VARCHAR(30) NOT NULL DEFAULT 'Submitted';
ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_review_status_check;
ALTER TABLE claims ADD CONSTRAINT claims_review_status_check CHECK (review_status IN ('Submitted', 'In Review', 'Review Completed'));

INSERT INTO claim_activity_logs (claim_id, event_type, description)
SELECT id, 'claim_submitted', 'Claim submitted and entered the review queue.'
FROM claims
WHERE NOT EXISTS (SELECT 1 FROM claim_activity_logs l WHERE l.claim_id = claims.id);
