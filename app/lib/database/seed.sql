-- This seed file is used to seed the database with initial data.

-- Local D1 database can be seeded using:
-- ```sh
-- pnpm db:seed
-- ```

-- Remote D1 database can be seeded using:
-- ```sh
-- pnpm db:seed-prod
-- ```

-- Insert users with different roles
INSERT INTO user (
  id,
  name,
  email,
  emailVerified,
  image,
  role,
  banned,
  banReason,
  banExpires,
  createdAt,
  updatedAt
) VALUES
-- Regular user
(
  'nt2AZZSr3ci6OWUpEG38f7GZwUBJ01CZ',
  'John Doe',
  'john@example.com',
  1,
  null,
  'user',
  0,
  null,
  null,
  1704067200, -- 2024-01-01 00:00:00
  1704067200
),
-- Admin user
(
  'F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS',
  'Jane Smith',
  'admin@example.com',
  1,
  null,
  'admin',
  0,
  null,
  null,
  1704067200, -- 2024-01-01 00:00:00
  1704067200
);

-- Insert accounts for the users
INSERT INTO account (
  id,
  accountId,
  providerId,
  userId,
  accessToken,
  refreshToken,
  idToken,
  accessTokenExpiresAt,
  refreshTokenExpiresAt,
  scope,
  password,
  createdAt,
  updatedAt
) VALUES
-- Account for regular user (email/password provider)
(
  'Ostf4Fx16wNiBV7Et6DDJzLWWEAZ0FyJ',
  'john@example.com',
  'credential',
  'nt2AZZSr3ci6OWUpEG38f7GZwUBJ01CZ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '9eef0c5c41fddc1869f3e27dd52b8aea:5c25fec52b69576c13cbd06e013d2fe5fba3742ef9128cc98fa70e6ba9f8206a564bbdeaee23c8a295f96246d5ca465db86b025185924447eef94b3f6801dcb4', -- hashed password: 'user@9900'
  1704067200,
  1704067200
),
-- Account for admin user (email/password provider)
(
  'W8Oa8UCI6sKswFaF8uzIKkmRfP3HRIaD',
  'admin@example.com',
  'credential',
  'F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'b47e2466463c1b19d5a58f3e15775889:3f35be608e65080399c90ebe4731176a5c91d976da03ad08b22d065e56f1f1db5eea6e3ef71451f7bc6b58398e3ffa03acc3ca193d5997a4881897503c29a4a5', -- hashed password: 'admin@8899'
  1704067200,
  1704067200
);
