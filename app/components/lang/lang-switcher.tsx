import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useHydrated } from "~/hooks/use-hydrated";
import {
  fallbackLng,
  getLocalePath,
  locales,
  localesByLang,
  supportedLngs,
} from "~/lib/i18n";

export function LangSwitcher() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    if (!supportedLngs.includes(lang)) {
      return;
    }

    const path = getLocalePath(pathname, lang);
    // console.log(`LangSwitcher: lang = ${lang}, path = ${path}`);
    navigate(path, { replace: true });
  };

  const handleChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const lang = e.currentTarget.dataset.lang || fallbackLng;
    changeLanguage(lang);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {localesByLang[i18n.language]?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((v) => {
          return (
            <DropdownMenuItem
              key={v.lang}
              data-lang={v.lang}
              onClick={handleChange}
            >
              {v.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
