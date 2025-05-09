import { createAuthClient } from "better-auth/react";

export type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = AuthClient["$Infer"]["Session"];
export type AuthProviderType = Parameters<
  AuthClient["linkSocial"]
>[0]["provider"];

export const authClient = createAuthClient();
