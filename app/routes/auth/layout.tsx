import { ArrowLeftIcon } from "lucide-react";
import { Link, Outlet, redirect } from "react-router";

import { serverAuth } from "~/auth/auth.server";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/layout";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = serverAuth(context.cloudflare.env);
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: request.headers,
  });
  return session ? redirect("/dashboard") : null;
}

export default function AuthLayout() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Button variant="ghost" size="sm" className="fixed left-4 top-4" asChild>
        <Link to="/">
          <ArrowLeftIcon className="size-4" /> Home
        </Link>
      </Button>
      <div className="mx-auto w-[300px] sm:w-[360px]">
        <Outlet />
      </div>
    </div>
  );
}
