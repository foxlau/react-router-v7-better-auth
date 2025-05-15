import {
  HardDriveIcon,
  KeyIcon,
  Link2Icon,
  type LucideIcon,
  SunMoonIcon,
  UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, href } from "react-router";
import { filterLocale } from "~/lib/i18n";

import { cn } from "~/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

function getMenuItems(lang: string): MenuItem[] {
  return [
    {
      title: "Account",
      url: href("/:lang?/settings/account", filterLocale(lang)),
      icon: UserIcon,
    },
    {
      title: "Appearance",
      url: href("/:lang?/settings/appearance", filterLocale(lang)),
      icon: SunMoonIcon,
    },
    {
      title: "Connections",
      url: href("/:lang?/settings/connections", filterLocale(lang)),
      icon: Link2Icon,
    },
    {
      title: "Sessions",
      url: href("/:lang?/settings/sessions", filterLocale(lang)),
      icon: HardDriveIcon,
    },
    {
      title: "Password",
      url: href("/:lang?/settings/password", filterLocale(lang)),
      icon: KeyIcon,
    },
  ];
}

export function Menu() {
  const { i18n } = useTranslation();
  const menuItems = getMenuItems(i18n.language);

  return (
    <div className="pb-12">
      <div className="relative flex gap-6 overflow-x-auto sm:gap-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "relative flex items-center justify-start gap-1.5 py-4 text-muted-foreground",
                {
                  "font-medium text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:content-['']":
                    isActive,
                },
              )
            }
          >
            <item.icon className="size-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
        <div className="-z-10 absolute inset-x-0 bottom-0 h-0.5 bg-muted" />
      </div>
    </div>
  );
}
