import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => ({
  plugins: [
    cloudflareTest({
      remoteBindings: false,
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations('./drizzle/migrations'),
          TEST_SEEDS: await readD1Migrations('./drizzle/seed'),
          VITE_BASE_URL: 'http://localhost:5173',
          SESSION_SECRET: 'test-session-secret-at-least-32-characters-long',
          BETTER_AUTH_SECRET: 'test-auth-secret-at-least-32-characters-long',
          BETTER_AUTH_ADMIN_USER_ID: 'test-admin',
          GITHUB_CLIENT_ID: 'test-github-client',
          GITHUB_CLIENT_SECRET: 'test-github-secret',
          GOOGLE_CLIENT_ID: 'test-google-client',
          GOOGLE_CLIENT_SECRET: 'test-google-secret',
        },
        outboundService: () =>
          new Response('No internet in tests', { status: 502 }),
      },
    }),
  ],
  resolve: { tsconfigPaths: true },
  test: {
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
}))
