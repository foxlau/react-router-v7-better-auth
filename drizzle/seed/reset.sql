-- Clear local application/auth data without dropping tables or migration history.
DELETE FROM todos;
DELETE FROM sessions;
DELETE FROM accounts;
DELETE FROM verifications;
DELETE FROM rate_limits;
DELETE FROM users;
