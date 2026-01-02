import type { ClientHint } from "./client-hints";

/**
 * Format a date/time using client hints with format: YYYY/MM/DD HH:mm:ss
 *
 * @param date - Date to format
 * @param hints - Client hints (locale and timezone) or partial hints with timeZone
 * @returns Formatted date string in format: 2025/10/12 12:00:00
 */
export function formatDateTimeWithHints(
	date: Date | string | number | null | undefined,
	hints?: Partial<ClientHint> & { timeZone?: string },
): string {
	if (!date) return "-";

	try {
		const dateObj = date instanceof Date ? date : new Date(date);

		const parts = new Intl.DateTimeFormat(hints?.locale ?? "en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
			timeZone: hints?.timeZone ?? "UTC",
		}).formatToParts(dateObj);

		// Helper to extract part value (2-digit option guarantees proper padding)
		const get = (type: Intl.DateTimeFormatPartTypes) =>
			parts.find((p) => p.type === type)?.value ?? "00";

		return `${get("year")}/${get("month")}/${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
	} catch {
		return "-";
	}
}
