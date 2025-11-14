import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, lastLoginMethod } from "better-auth/plugins";
import { cache } from "react";
import { db } from "~/lib/database/db.server";

export const serverAuth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  secondaryStorage: {
    get: async (key) => await env.APP_KV.get(`_auth:${key}`, "json"),
    set: async (key, value) =>
      await env.APP_KV.put(`_auth:${key}`, JSON.stringify(value)),
    delete: async (key) => await env.APP_KV.delete(`_auth:${key}`),
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      if (env.ENVIRONMENT === "development") {
        console.log("Send email to reset password");
        console.log("User", user);
        console.log("URL", url);
        console.log("Token", token);
      } else {
        // Send email to user ...
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      if (env.ENVIRONMENT === "development") {
        console.log("Send email to verify email address");
        console.log(user, url, token);
      } else {
        // Send email to user ...
      }
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ["google", "github"],
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        if (user.image) {
          await deleteUserImageFromR2(user.image);
        }
      },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60, // time window in seconds
    max: 10, // max requests in the window
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      adminUserIds: ["F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS"],
      impersonationSessionDuration: 60 * 60 * 24, // 1 day
    }),
    lastLoginMethod(),
  ],
});

export const getServerSession = cache(async (request: Request) => {
  const session = await serverAuth.api.getSession({
    headers: request.headers,
  });
  return session;
});

export const deleteUserImageFromR2 = async (imageUrl: string | null) => {
  if (!imageUrl) return;

  const isExternalUrl =
    imageUrl.startsWith("http://") || imageUrl.startsWith("https://");

  if (!isExternalUrl) {
    let r2ObjectKey = imageUrl;
    const queryParamIndex = r2ObjectKey.indexOf("?"); // remove query params
    if (queryParamIndex !== -1) {
      r2ObjectKey = r2ObjectKey.substring(0, queryParamIndex);
    }
    if (r2ObjectKey) {
      await env.R2.delete(r2ObjectKey);
    }
  }
};

export type AuthServerSession = Awaited<
  ReturnType<typeof serverAuth.api.getSession>
>;
