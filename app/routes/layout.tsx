import { CircleFadingPlusIcon } from "lucide-react";
import { Link, Outlet, data, href } from "react-router";

import { useTranslation } from "react-i18next";
import { AppLogo } from "~/components/app-logo";
import { ColorSchemeToggle } from "~/components/color-scheme-toggle";
import { Button } from "~/components/ui/button";
import { UserNav } from "~/components/user-nav";
import { authSessionContext } from "~/lib/contexts";
import { filterLocale } from "~/lib/i18n";
import { authMiddleware } from "~/middlewares/auth-guard.server";
import type { Route } from "./+types/layout";

export const unstable_middleware = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(authSessionContext);
  return data(authSession);
}

export default function AuthenticatedLayout(_: Route.ComponentProps) {
  const { i18n } = useTranslation();

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="flex w-full items-center justify-between p-4 sm:px-10">
          <Link
            to={href("/:lang?/home", filterLocale(i18n.language))}
            className="flex items-center gap-2"
          >
            <AppLogo />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={href("/:lang?/todos", filterLocale(i18n.language))}>
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
