import { useRouteLoaderData } from "react-router";
import type { loader as authLayoutLoader } from "~/routes/layout";

export function useAuthUser() {
  const data = useRouteLoaderData<typeof authLayoutLoader>("routes/layout");
  if (!data) throw new Error("No user data found.");
  return { ...data };
}
