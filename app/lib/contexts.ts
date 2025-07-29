import { type AppLoadContext, unstable_createContext } from "react-router";
import type { AuthSession } from "~/lib/auth/auth.client";

export type AuthWithRoleSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export const adapterContext = unstable_createContext<AppLoadContext>();
export const authSessionContext = unstable_createContext<AuthSession>();
