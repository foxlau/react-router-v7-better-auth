import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type SupportedLng, locales, localesByLang } from "~/lib/i18n/config";
import { useSetLocale } from "~/lib/i18n/hook";

export function LangSwitcher() {
  // const hydrated = useHydrated();
  const setLocale = useSetLocale();
  const { i18n } = useTranslation();

  const handleChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const lang = e.currentTarget.dataset.lang as SupportedLng;
    setLocale(lang);
  };

  // if (!hydrated) {
  //   return null;
  // }

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
