import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  ColorSchemeSchema,
  useColorScheme,
  useSetColorScheme,
} from "~/lib/color-scheme/components";
import { Button } from "./ui/button";

const THEME_ICONS = {
  light: <SunIcon className="size-4" />,
  dark: <MoonIcon className="size-4" />,
  system: <LaptopIcon className="size-4" />,
} as const;

export function ColorSchemeToggle() {
  const setColorScheme = useSetColorScheme();
  const colorScheme = useColorScheme();

  const getIcon = () => {
    switch (colorScheme) {
      case "dark":
        return <MoonIcon className="size-4" />;
      case "light":
        return <SunIcon className="size-4" />;
      default:
        return <LaptopIcon className="size-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle color scheme">
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ColorSchemeSchema.shape.colorScheme.options.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setColorScheme(value)}
            aria-selected={colorScheme === value}
            className="capitalize"
          >
            {THEME_ICONS[value]}
            {value}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
