import { adminClient, customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { serverAuth } from "./auth.server";

export type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = typeof authClient.$Infer.Session;

export const authClient = createAuthClient({
  plugins: [adminClient(), customSessionClient<typeof serverAuth>()],
});
