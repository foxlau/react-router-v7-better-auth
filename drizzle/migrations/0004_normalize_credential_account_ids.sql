-- Better Auth 1.7 identifies password accounts by account_id = user_id.
-- Normalize legacy credential accounts without changing OAuth provider IDs.
UPDATE accounts
SET account_id = user_id
WHERE provider_id = 'credential' AND account_id <> user_id;
