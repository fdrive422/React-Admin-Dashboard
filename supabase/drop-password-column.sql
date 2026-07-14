-- Migration: remove the plaintext `password` column from users.
--
-- The API never selects this column (no controller references it), and there is
-- no authentication flow in this app, so the seeded plaintext passwords serve no
-- purpose and shouldn't sit in the table. Run this once in the Supabase SQL
-- editor against an existing project that was created with the earlier schema.
--
-- (Fresh setups don't need this — supabase/schema.sql no longer creates the column.)

alter table users drop column if exists password;
