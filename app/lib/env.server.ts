import { env as cloudflareEnv } from "cloudflare:workers";
import { z } from "~/lib/validations/zod-i18n";

/**
 * Server environment schema definition with validation rules
 */
const serverEnvSchema = z.object({
  ENVIRONMENT: z.enum(["development", "production"]).default("development"),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Add other server-only variables here...
});

/**
 * Validated server environment variables
 */
export const env = (() => {
  const parsed = serverEnvSchema.safeParse(cloudflareEnv);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const validatedData = parsed.data;
  Object.freeze(validatedData); // Ensure immutability

  // Only log in development for better production security
  if (validatedData.ENVIRONMENT === "development") {
    console.log(`✅ Environment: ${validatedData.ENVIRONMENT}`);
  }

  return validatedData;
})();

// Environment convenience exports
export const isDevelopment = env.ENVIRONMENT === "development";
export const isProduction = env.ENVIRONMENT === "production";

/**
 * Returns a subset of environment variables that are safe to expose to the client.
 * SECURITY WARNING: Be careful what you expose here - never include API keys,
 * secrets, or sensitive information as these will be visible in the browser.
 */
export function getPublicEnv() {
  return {
    // Add other public variables here that are safe to expose...
  };
}

export type PublicEnv = ReturnType<typeof getPublicEnv>;

// Global types for environment access
declare global {
  // Type for the validated server environment
  type ValidatedServerEnv = z.infer<typeof serverEnvSchema>;

  // Type for the public env available globally (server/client)
  var ENV: PublicEnv;
  interface Window {
    ENV: PublicEnv;
  }
}
