import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useHydrated } from "~/hooks/use-hydrated";
import { getTheme, setTheme as setSystemTheme } from "./theme-switcher";
import { Button } from "./ui/button";

export function ThemeSelector() {
  const [, rerender] = useState({});
  const hydrated = useHydrated();
  const theme = getTheme();
  const setTheme = useCallback((theme: string) => {
    setSystemTheme(theme);
    rerender({});
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          title="Theme selector"
          className="size-8 rounded-full ring-0 focus-visible:ring-opacity-0"
        >
          <span className="sr-only">Theme selector</span>
          {!hydrated ? null : theme === "dark" ? (
            <MoonIcon />
          ) : theme === "light" ? (
            <SunIcon />
          ) : (
            <LaptopIcon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full"
            onClick={() => setTheme("light")}
            aria-selected={theme === "light"}
          >
            Light
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full"
            onClick={() => setTheme("dark")}
            aria-selected={theme === "dark"}
          >
            Dark
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full"
            onClick={() => setTheme("system")}
            aria-selected={theme === "system"}
          >
            System
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
