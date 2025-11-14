import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = typeof authClient.$Infer.Session;

export const authClient = createAuthClient({
  plugins: [adminClient(), lastLoginMethodClient()],
});
