import {
	CheckIcon,
	MinusIcon,
	MonitorIcon,
	MoonIcon,
	SunIcon,
} from "lucide-react";
import { href, useFetcher } from "react-router";
import { useRequestInfo } from "~/hooks/use-request-info";
import { type Theme, useOptimisticThemeMode } from "~/lib/client-hints";
import { cn } from "~/lib/utils";
import UiDark from "/images/ui-dark.png";
import UiLight from "/images/ui-light.png";
import UiSystem from "/images/ui-system.png";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const themes: Array<{ key: Theme; icon: typeof SunIcon; label: string }> = [
	{ key: "light", icon: SunIcon, label: "Light" },
	{ key: "dark", icon: MoonIcon, label: "Dark" },
	{ key: "system", icon: MonitorIcon, label: "System" },
];

const THEME_IMAGES = {
	light: UiLight,
	dark: UiDark,
	system: UiSystem,
} as const;

export const themeSwitcherAction = href("/api/theme-switcher");

/**
 * Hook to get the current theme mode.
 * @internal
 */
function useThemeMode() {
	const requestInfo = useRequestInfo();
	const optimisticMode = useOptimisticThemeMode();
	return optimisticMode ?? requestInfo.userPrefs.theme ?? "system";
}

/**
 * The theme switcher component.
 * @public
 */
export function ThemeSwitcher() {
	const fetcher = useFetcher({ key: "theme-fetcher" });
	const theme = useThemeMode();

	return (
		<fetcher.Form
			method="POST"
			action={themeSwitcherAction}
			className="isolate flex h-8 rounded-full bg-background p-1 shadow-xs ring-1 ring-border"
		>
			{themes.map(({ key, icon: Icon, label }) => {
				const isActive = key === theme;
				return (
					<button
						key={key}
						value={key}
						aria-label={label}
						disabled={isActive}
						type="submit"
						name="theme"
						className={cn(
							"flex size-6 items-center justify-center rounded-full",
							{ "bg-secondary": isActive },
						)}
					>
						<Icon
							className={cn(
								"relative z-10 m-auto size-4",
								isActive ? "text-foreground" : "text-muted-foreground",
							)}
						/>
					</button>
				);
			})}
		</fetcher.Form>
	);
}

/**
 * Theme selector radio group component.
 * Used inside DropdownMenuContent or other menu contexts.
 * @public
 */
export function ThemeSelectorRadioGroup() {
	const fetcher = useFetcher({ key: "theme-fetcher" });
	const mode = useThemeMode();

	return (
		<DropdownMenuRadioGroup
			value={mode}
			onValueChange={(theme) =>
				fetcher.submit(
					{ theme },
					{
						method: "POST",
						action: themeSwitcherAction,
					},
				)
			}
		>
			{themes.map(({ key, label }) => (
				<DropdownMenuRadioItem key={key} value={key}>
					{label}
				</DropdownMenuRadioItem>
			))}
		</DropdownMenuRadioGroup>
	);
}

/**
 * The theme selector component.
 * @public
 */
export function ThemeSelector() {
	const mode = useThemeMode();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					{mode === "light" ? (
						<SunIcon className="size-4" />
					) : mode === "dark" ? (
						<MoonIcon className="size-4" />
					) : (
						<MonitorIcon className="size-4" />
					)}
					<span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<ThemeSelectorRadioGroup />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Theme radio group component with image previews.
 * Used in settings pages for visual theme selection.
 * @public
 */
export function ThemeRadioGroup() {
	const fetcher = useFetcher({ key: "theme-fetcher" });
	const theme = useThemeMode();

	const themeOptions: Theme[] = ["light", "dark", "system"];

	return (
		<RadioGroup
			className="grid grid-cols-3 gap-4 py-4 sm:gap-6"
			name="theme"
			value={theme}
			onValueChange={(value: Theme) =>
				fetcher.submit(
					{ theme: value },
					{
						method: "POST",
						action: themeSwitcherAction,
					},
				)
			}
		>
			{themeOptions.map((value) => (
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
	);
}
