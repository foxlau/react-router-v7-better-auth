import { CircleFadingPlusIcon } from "lucide-react";
import { href, Link, Outlet } from "react-router";
import { AppLogo } from "~/components/app-logo";
import { ColorSchemeToggle } from "~/components/color-scheme-toggle";
import { Button } from "~/components/ui/button";
import { UserNav } from "~/components/user-nav";
import { requireAuth, requireUser } from "~/middlewares/auth-guard";
import type { Route } from "./+types/layout";

export const middleware = [requireAuth];

export async function loader(_: Route.LoaderArgs) {
  return requireUser();
}

export default function AuthenticatedLayout(_: Route.ComponentProps) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="flex w-full items-center justify-between p-4 sm:px-10">
          <Link to={href("/home")} className="flex items-center gap-2">
            <AppLogo />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/todos">
                <CircleFadingPlusIcon />
              </Link>
            </Button>
            <ColorSchemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4 sm:p-10">
        <Outlet />
      </main>
    </>
  );
}
