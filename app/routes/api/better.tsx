import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { serverAuth } from "~/lib/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const auth = serverAuth();
  return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
  const auth = serverAuth();
  return auth.handler(request);
}
