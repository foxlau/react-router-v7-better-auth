import { type AppLoadContext, unstable_createContext } from "react-router";
import type { AuthClient } from "~/lib/auth/auth.client";

export const adapterContext = unstable_createContext<AppLoadContext>();

export const authSessionContext =
  unstable_createContext<AuthClient["$Infer"]["Session"]>();
