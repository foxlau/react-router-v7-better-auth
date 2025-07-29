import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { serverAuth } from "~/lib/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return serverAuth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return serverAuth.handler(request);
}
