/**
 * Badge component to display "Last used" indicator
 * Used in authentication forms to show which login method was last used
 */
export function LastUsedBadge() {
	return (
		<span className="dark:bg-muted absolute top-0 right-0 rounded-bl-md bg-blue-50 px-2 py-0.5 text-[10px] text-blue-500 capitalize dark:text-white">
			Last used
		</span>
	);
}
