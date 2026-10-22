import type { FC, SVGProps } from "react";
import { useState } from "react";
import { useRevalidator } from "react-router";
import { toast } from "sonner";
import { authClient } from "~/services/auth/auth.client";
import { DateTimeDisplay } from "../datetime-display";
import { LoadingButton } from "../forms";

export function SocialConnection({
	connection,
}: {
	connection: {
		provider: "github" | "google";
		displayName: string;
		icon: FC<SVGProps<SVGSVGElement>>;
		account?: {
			id: string;
			createdAt: Date;
		};
	};
}) {
	const revalidator = useRevalidator();
	const [isPending, setIsPending] = useState(false);
	const isConnected = Boolean(connection.account);
	const variant = isConnected ? "secondary" : "outline";
	const label = isConnected ? "Disconnect" : "Connect";
	const errorMessage = isConnected
		? "Failed to disconnect."
		: "Failed to connect.";

	const handleConnection = async () => {
		if (isPending) return;
		setIsPending(true);

		try {
			const { error } = connection.account
				? await authClient.unlinkAccount({ accountId: connection.account.id })
				: await authClient.linkSocial({
						provider: connection.provider,
						callbackURL: "/settings/connections",
					});

			if (error) {
				toast.error(error.message || errorMessage);
				return;
			}

			if (connection.account) {
				await revalidator.revalidate();
			}
		} catch {
			toast.error(errorMessage);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="hover:bg-accent flex flex-col gap-2 px-4 py-3">
			<div className="flex items-center gap-2">
				<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
					<connection.icon className="size-5" />
				</div>
				<div className="flex flex-col gap-0.5">
					<p className="text-sm font-medium">{connection.displayName}</p>
					<p className="text-muted-foreground text-xs">
						{connection.account ? (
							<>
								Connected on{" "}
								<DateTimeDisplay
									className="text-xs"
									date={connection.account.createdAt}
								/>
							</>
						) : (
							"Not connected"
						)}
					</p>
				</div>
				<div className="ml-auto">
					<LoadingButton
						size="sm"
						variant={variant}
						buttonText={label}
						loadingText={isConnected ? "Disconnecting..." : "Connecting..."}
						isPending={isPending}
						onClick={handleConnection}
					/>
				</div>
			</div>
		</div>
	);
}
