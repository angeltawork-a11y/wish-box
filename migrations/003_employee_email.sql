ALTER TABLE employees ADD COLUMN IF NOT EXISTS email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS employees_email_unique
  ON employees (LOWER(email))
  WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS email_login_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_login_codes_email_idx
  ON email_login_codes (LOWER(email));
