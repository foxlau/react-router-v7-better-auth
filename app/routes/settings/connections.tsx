import { GithubIcon, GoogleIcon } from "~/components/icons";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { SocialConnection } from "~/components/settings/social-connection";
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

	return { accounts };
}

export default function ConnectionsRoute({
	loaderData: { accounts },
}: Route.ComponentProps) {
	return (
		<SettingsLayout
			title="Connections"
			description="You can connect your account to third-party services below."
		>
			<div className="py-4">
				<div className="divide-y overflow-hidden rounded-lg border shadow-xs">
					<SocialConnection
						connection={{
							provider: "github",
							displayName: "GitHub",
							icon: GithubIcon,
							isConnected: accounts.some((acc) => acc.providerId === "github"),
							createdAt: new Date(),
						}}
					/>
					<SocialConnection
						connection={{
							provider: "google",
							displayName: "Google",
							icon: GoogleIcon,
							isConnected: accounts.some((acc) => acc.providerId === "google"),
							createdAt: new Date(),
						}}
					/>
				</div>
			</div>
		</SettingsLayout>
	);
}
