ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS review_disposition TEXT NOT NULL DEFAULT 'Pending', ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.claims ADD CONSTRAINT claims_review_disposition_check CHECK (review_disposition IN ('Pending','Reviewed - More Information Required','Reviewed - Ready for Insurer Decision'));
