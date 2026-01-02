import { data } from "react-router";
import { ConnectionItem } from "~/components/settings/connection-item";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { SOCIAL_PROVIDER_CONFIGS } from "~/lib/config";
import { getPageTitle } from "~/lib/utils";
import { auth } from "~/services/auth/auth.server";
import type { Route } from "./+types/connections";

export function meta() {
	return [{ title: getPageTitle("Connections") }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const accounts = await auth.api.listUserAccounts({
		headers: request.headers,
	});
	return data({ accounts });
}

export default function ConnectionsRoute({
	loaderData: { accounts },
}: Route.ComponentProps) {
	const connections = SOCIAL_PROVIDER_CONFIGS.map((config) => {
		const account = accounts.find((acc) => acc.providerId === config.id);
		return {
			provider: config.id,
			displayName: config.name,
			icon: config.icon,
			isConnected: !!account,
			createdAt: account?.createdAt,
		};
	});

	return (
		<SettingsLayout
			title="Connections"
			description="You can connect your account to third-party services below."
		>
			<div className="py-4">
				<div className="divide-y overflow-hidden rounded-lg border shadow-xs">
					{connections.map((connection) => (
						<ConnectionItem key={connection.provider} connection={connection} />
					))}
				</div>
			</div>
		</SettingsLayout>
	);
}
