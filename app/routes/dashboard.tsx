import { ListTodoIcon, type LucideIcon, UserCogIcon } from "lucide-react";
import { Link, href, useLoaderData } from "react-router";

import { useTranslation } from "react-i18next";
import { useAuthUser } from "~/hooks/use-auth-user";
import { AppInfo } from "~/lib/config";
import { getInstance, getLocale } from "~/middlewares/i18next";
import type { Route } from "./+types/dashboard";

type NavLink = {
  to: string;
  icon: LucideIcon;
  label: string;
  description: string;
};

export const meta: Route.MetaFunction = () => {
  return [{ title: `Home - ${AppInfo.name}` }];
};

export async function loader({ context }: Route.LoaderArgs) {
  const { t } = getInstance(context);
  const locale = getLocale(context);
  const date = new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return { date, title: t("title"), description: t("description") };
}

export default function DashboardRoute(_: Route.ComponentProps) {
  const { user } = useAuthUser();
  const { date } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const navLinks: NavLink[] = [
    {
      to: href("/todos"),
      icon: ListTodoIcon,
      label: t("dashboard.todo.label"),
      description: t("dashboard.todo.description"),
    },
    {
      to: href("/settings/account"),
      icon: UserCogIcon,
      label: t("dashboard.account.label"),
      description: t("dashboard.account.description"),
    },
  ];

  return (
    <>
      <header className="space-y-2">
        <h2 className="font-semibold text-base">
          <span className="mr-2 text-xl">👋</span> Hi, {user.name}!
        </h2>
        <p className="text-muted-foreground">
          {t("dashboard.welcome")} {date}
        </p>
      </header>

      <NavLinks links={navLinks} />
    </>
  );
}

function NavLinks({ links }: { links: NavLink[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 sm:gap-6">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className="inline-flex w-full whitespace-nowrap rounded-lg border border-border bg-background px-5 py-4 shadow-xs hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring/70"
          >
            <div className="flex flex-col gap-2">
              <link.icon size={28} className="shrink-0 opacity-50" />
              <div className="flex flex-col">
                <h3 className="font-medium">{link.label}</h3>
                <p className="text-muted-foreground text-sm">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
