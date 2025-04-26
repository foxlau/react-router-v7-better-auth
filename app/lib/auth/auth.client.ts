import { createAuthClient } from "better-auth/react";

export type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient = createAuthClient();
