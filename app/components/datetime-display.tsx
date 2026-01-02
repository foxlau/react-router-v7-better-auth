import { useOptionalHints } from "~/lib/client-hints";
import { formatDateTimeWithHints } from "~/lib/datetime";
import { cn } from "~/lib/utils";

/**
 * React component to format date/time using client hints
 * Use this in React components to avoid SSR errors
 *
 * @param date - Date to format
 * @returns Formatted date string in format: 2025/10/12 12:00:00
 */
export function DateTimeDisplay({
	date,
	className,
}: {
	date: Date | string | number | null | undefined;
	className?: string;
}) {
	const hints = useOptionalHints();
	const formatted = formatDateTimeWithHints(date, {
		timeZone: hints?.timeZone,
		locale: "en-US", // Use fixed locale for consistent format
	});
	return (
		<span className={cn("text-muted-foreground text-sm", className)}>
			{formatted}
		</span>
	);
}
