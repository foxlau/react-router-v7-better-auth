import type { FC, SVGProps } from "react";

import type { AllowedProvider } from "~/lib/config";
import { DateTimeDisplay } from "../datetime-display";
import { ConnectionAction } from "./connection-action";

export function ConnectionItem({
	connection,
}: {
	connection: {
		provider: AllowedProvider;
		displayName: string;
		icon: FC<SVGProps<SVGSVGElement>>;
		isConnected: boolean;
		createdAt?: Date | null;
	};
}) {
	return (
		<div className="flex flex-col gap-2 px-4 py-3 hover:bg-accent">
			<div className="flex items-center gap-2">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
					<connection.icon className="size-5" />
				</div>
				<div className="flex flex-col gap-0.5">
					<p className="font-medium text-sm">{connection.displayName}</p>
					<p className="text-muted-foreground text-xs">
						{connection.isConnected && connection.createdAt ? (
							<>
								Connected on <DateTimeDisplay date={connection.createdAt} />
							</>
						) : (
							"Not connected"
						)}
					</p>
				</div>
				<div className="ml-auto">
					<ConnectionAction
						provider={connection.provider}
						isConnected={connection.isConnected}
					/>
				</div>
			</div>
		</div>
	);
}
