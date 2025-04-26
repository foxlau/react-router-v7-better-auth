import { HouseIcon, PlusIcon } from "lucide-react";
import { Link, Outlet, data } from "react-router";
import { ThemeSelector } from "~/components/theme-selector";
import { Button } from "~/components/ui/button";
import { UserNav } from "~/components/user-nav";
import { authSessionContext } from "~/lib/contexts";
import { authMiddleware } from "~/lib/middlewares/auth-guard.server";
import type { Route } from "./+types/layout";

export const unstable_middleware = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(authSessionContext);
  return data(authSession);
}

export default function Layout({ loaderData }: Route.ComponentProps) {
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
            <Link to="/">
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
          <UserNav user={loaderData.user} />
        </div>
      </header>
      <main className="mx-auto max-w-xl px-6 pt-6 pb-36">
        <Outlet />
      </main>
    </>
  );
}
