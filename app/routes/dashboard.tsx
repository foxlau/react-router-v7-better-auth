import { toast } from "sonner";
import { ConnectedAccountItem, DeleteAccount } from "~/components/account";
import { RevokeOtherSessions, SessionItem } from "~/components/session";
import { useAuthUser } from "~/hooks/use-auth-user";
import { authClient } from "~/lib/auth/auth.client";
import { serverAuth } from "~/lib/auth/auth.server";
import type { Route } from "./+types/dashboard";

export const meta: Route.MetaFunction = () => [{ title: "Dashboard" }];

export async function loader({ request }: Route.LoaderArgs) {
  const auth = serverAuth();

  const [accounts, listSessions] = await Promise.all([
    auth.api.listUserAccounts({ headers: request.headers }),
    auth.api.listSessions({ headers: request.headers }),
  ]);

  return { accounts, listSessions };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
      case "revokeOtherSessions":
        return await authClient.revokeOtherSessions();
      case "logout":
        return await authClient.signOut();
      case "deleteUser":
        return await authClient.deleteUser();
      default:
        throw new Error(`Unknown intent: ${intent}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return toast.error(message);
  }
}

export default function Dashboard({
  loaderData: { accounts, listSessions },
}: Route.ComponentProps) {
  const { user, session } = useAuthUser();

  return (
    <div className="space-y-10">
      {/* User Info */}
      <section className="space-y-2">
        <h1 className="font-semibold text-base capitalize">{user.name}</h1>
        <p className="text-foreground/70">{user.email}</p>
      </section>

      <hr />

      {/* Connected Accounts */}
      <section className="space-y-4">
        <h2 className="font-semibold">Connected accounts</h2>
        <div className="space-y-4">
          {accounts
            ? accounts.map((account) => (
                <ConnectedAccountItem
                  key={account.id}
                  account={account}
                  email={user?.email}
                />
              ))
            : null}
        </div>
      </section>

      <hr />

      {/* Recent Sessions */}
      <section className="space-y-4">
        <h2 className="font-semibold">Recent sessions</h2>
        <p className="text-foreground/70">
          If necessary, you can sign out of all other browser sessions. Some of
          your recent sessions are listed below, but this list may not be
          complete. If you think your account has been compromised, you should
          also update your password.
        </p>
        <div className="space-y-2">
          {listSessions.map((item) => (
            <SessionItem
              key={item.token}
              session={item}
              currentSessionToken={session.token}
            />
          ))}
        </div>
        {listSessions.length > 1 && <RevokeOtherSessions />}
      </section>

      <hr />

      {/* Delete Account */}
      <DeleteAccount />
    </div>
  );
}
