import { HouseIcon, PlusIcon } from "lucide-react";
import { Link, Outlet, redirect } from "react-router";

import { serverAuth } from "~/auth/auth.server";
import { ThemeSelector } from "~/components/theme-selector";
import { Button } from "~/components/ui/button";
import { UserNav } from "~/components/user-nav";
import type { Route } from "./+types/layout";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = serverAuth(context.cloudflare.env);
  const authSession = await auth.api.getSession({
    headers: request.headers,
  });

  if (!authSession) {
    throw redirect("/auth/sign-in");
  }

  return { authSession };
}

export default function Layout({
  loaderData: { authSession },
}: Route.ComponentProps) {
  return (
    <>
      <header className="relative flex w-full items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            asChild
          >
            <Link to="/dashboard">
              <HouseIcon />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            asChild
          >
            <Link to="/todos">
              <PlusIcon />
            </Link>
          </Button>
          <ThemeSelector />
          <UserNav user={authSession.user} />
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 pb-36 pt-6">
        <Outlet />
      </main>
    </>
  );
}
