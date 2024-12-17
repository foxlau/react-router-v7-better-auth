import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { serverAuth } from "~/auth/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = serverAuth(context.cloudflare.env);
  return auth.handler(request);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = serverAuth(context.cloudflare.env);
  return auth.handler(request);
}
