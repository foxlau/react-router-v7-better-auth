import { data } from "react-router";

import { ConnectionItem } from "~/components/settings/connection-item";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { serverAuth } from "~/lib/auth/auth.server";
import { AppInfo, SOCIAL_PROVIDER_CONFIGS } from "~/lib/config";
import { formatDate } from "~/lib/utils";
import type { Route } from "./+types/connections";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Connections - ${AppInfo.name}` }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const auth = serverAuth();
  const accounts = await auth.api.listUserAccounts({
    headers: request.headers,
  });
  return data({ accounts });
}

export default function ConnectionsRoute({
  loaderData: { accounts },
}: Route.ComponentProps) {
  const connections = SOCIAL_PROVIDER_CONFIGS.map((config) => {
    const account = accounts.find((acc) => acc.provider === config.id);
    return {
      provider: config.id,
      displayName: config.name,
      icon: config.icon,
      isConnected: !!account,
      createdAt: account?.createdAt
        ? formatDate(account.createdAt, "MMM d, yyyy hh:mm a")
        : null,
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
