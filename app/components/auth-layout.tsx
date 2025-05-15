import { ArrowLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, href } from "react-router";
import { Button } from "~/components/ui/button";
import { filterLocale } from "~/lib/i18n";
import { ColorSchemeToggle } from "./color-scheme-toggle";
import { LangSwitcher } from "./lang/lang-switcher";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Button variant="ghost" size="sm" className="fixed top-4 left-4" asChild>
        <Link to={href("/:lang?", filterLocale(i18n.language)) || "/"}>
          <ArrowLeftIcon className="size-4" /> {t("home.title")}
        </Link>
      </Button>
      <div className="fixed top-4 right-4 flex items-center gap-2 sm:right-10">
        <LangSwitcher />
        <ColorSchemeToggle />
      </div>
      <div className="mx-auto w-[300px] sm:w-[360px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="font-semibold text-lg">{title}</h1>
            <p className="text-balance text-muted-foreground text-sm">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
