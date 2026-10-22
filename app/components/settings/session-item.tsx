import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import { parseUserAgent } from "~/lib/utils";
import type { Route } from "../../routes/settings/+types/sessions";
import { DateTimeDisplay } from "../datetime-display";

export function SessionItem({
	session,
	currentSessionToken,
}: {
	session: Awaited<Route.ComponentProps["loaderData"]["listSessions"]>[number];
	currentSessionToken: string;
}) {
	const { system, browser, isMobile } = parseUserAgent(session.userAgent || "");
	const isCurrentSession = session.token === currentSessionToken;

	return (
		<div className="flex w-full items-center justify-between gap-4 px-4 py-3">
			<div className="shrink-0">
				{isMobile ? (
					<SmartphoneIcon className="text-muted-foreground size-4" />
				) : (
					<MonitorIcon className="text-muted-foreground size-4" />
				)}
			</div>
			<div className="flex flex-1 flex-col gap-1">
				<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
					<span className="font-mono">
						{system}
						<small className="text-muted-foreground mx-1">•</small>
						{browser}
					</span>
					{isCurrentSession && (
						<span className="flex h-3 shrink-0 items-center gap-1 rounded-md border border-emerald-600 px-0.5 text-xs text-emerald-600 sm:h-auto sm:px-1.5 dark:border-emerald-500 dark:text-emerald-400">
							<span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
							<span className="hidden sm:inline">Current device</span>
						</span>
					)}
				</div>

				<div className="text-muted-foreground space-x-2 text-xs">
					<span>IP Address: {session.ipAddress || "unknown"}</span>
					<span>
						Expires at:{" "}
						<DateTimeDisplay date={session.expiresAt} className="text-xs" />
					</span>
				</div>
			</div>
		</div>
	);
}
