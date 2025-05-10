import { createAuthClient } from "better-auth/react";

export type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = AuthClient["$Infer"]["Session"];

export const authClient = createAuthClient();
