-- This seed file is used to seed the database with initial data.

-- Remote D1 database can be seeded using:
-- ```sh
-- pnpm db:seed:remote
-- ```

-- Seed users table
INSERT INTO users (
  id,
  name,
  email,
  email_verified,
  image,
  username,
  display_username,
  role,
  banned,
  ban_reason,
  ban_expires,
  created_at,
  updated_at
) VALUES (
  'F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS',
  'Andy Smith',
  'admin@example.com',
  1,
  NULL,
  'andy',
  'Andy S',
  'admin',
  0,
  NULL,
  NULL,
  1727874220520,
  1733186807616
);

-- Seed accounts table
INSERT INTO accounts (
  id,
  account_id,
  provider_id,
  user_id,
  access_token,
  refresh_token,
  id_token,
  scope,
  password,
  access_token_expires_at,
  refresh_token_expires_at,
  created_at,
  updated_at
) VALUES (
  'W8Oa8UCI6sKswFaF8uzIKkmRfP3HRIaD',
  'account_F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS',
  'credential',
  'F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS',
  NULL,
  NULL,
  NULL,
  NULL,
  'b47e2466463c1b19d5a58f3e15775889:3f35be608e65080399c90ebe4731176a5c91d976da03ad08b22d065e56f1f1db5eea6e3ef71451f7bc6b58398e3ffa03acc3ca193d5997a4881897503c29a4a5',
  NULL,
  NULL,
  1757142908247,
  1721505018863
);
