import { CheckIcon, MinusIcon } from "lucide-react";

import { SettingsLayout } from "~/components/settings/settings-layout";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  type ColorScheme,
  ColorSchemeSchema,
  useColorScheme,
  useSetColorScheme,
} from "~/lib/color-scheme/components";
import { AppInfo } from "~/lib/config";
import UiDark from "/images/ui-dark.png";
import UiLight from "/images/ui-light.png";
import UiSystem from "/images/ui-system.png";
import type { Route } from "./+types/appearance";

const THEME_IMAGES = {
  light: UiLight,
  dark: UiDark,
  system: UiSystem,
} as const;

export const meta: Route.MetaFunction = () => {
  return [{ title: `Appearance - ${AppInfo.name}` }];
};

export default function AppearanceRoute() {
  const setColorScheme = useSetColorScheme();
  const colorScheme = useColorScheme();

  return (
    <SettingsLayout
      title="Appearance"
      description="Customize the appearance of the app. Automatically switch between day and night themes."
    >
      <RadioGroup
        className="grid grid-cols-3 gap-4 py-4 sm:gap-6"
        name="colorScheme"
        value={colorScheme}
        defaultValue={colorScheme}
        onValueChange={(value: ColorScheme) => setColorScheme(value)}
      >
        {ColorSchemeSchema.shape.colorScheme.options.map((value) => (
          <label key={value} htmlFor={value} className="relative">
            <RadioGroupItem id={value} value={value} className="peer sr-only" />
            <img
              src={THEME_IMAGES[value]}
              alt={value}
              width={220}
              height={160}
              className="relative cursor-pointer overflow-hidden rounded-lg border border-input shadow-xs outline-none transition-[color,box-shadow] peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-data-disabled:cursor-not-allowed peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent peer-data-disabled:opacity-50"
            />
            <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
              <CheckIcon
                size={16}
                className="group-peer-data-[state=unchecked]:hidden"
                aria-hidden="true"
              />
              <MinusIcon
                size={16}
                className="group-peer-data-[state=checked]:hidden"
                aria-hidden="true"
              />
              <span className="font-medium text-xs">{value}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </SettingsLayout>
  );
}
