import { redirect } from "react-router";

import { authClient } from "~/auth/auth.client";
import { serverAuth } from "~/auth/auth.server";
import { ConnectedAccountItem, DeleteAccount } from "~/components/account";
import { Separator } from "~/components/separator";
import { RevokeOtherSessions, SessionItem } from "~/components/session";
import type { Route } from "./+types/dashboard";

export const meta: Route.MetaFunction = () => [{ title: "Dashboard" }];

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = serverAuth(context.cloudflare.env);

  const [authSession, accounts, listSessions] = await Promise.all([
    auth.api.getSession({
      query: {
        disableCookieCache: true,
      },
      headers: request.headers,
    }),
    auth.api.listUserAccounts({ headers: request.headers }),
    auth.api.listSessions({ headers: request.headers }),
  ]);

  if (!authSession) {
    throw redirect("/auth/sign-in");
  }

  return { authSession, accounts, listSessions };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
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
      return null;
  }
}

export default function Dashboard({
  loaderData: { authSession, accounts, listSessions },
}: Route.ComponentProps) {
  return (
    <div className="space-y-10">
      {/* User Info */}
      <section className="space-y-2">
        <h1 className="text-base font-semibold capitalize">
          {authSession.user.name}
        </h1>
        <p className="text-foreground/70">{authSession.user.email}</p>
      </section>

      <Separator />

      {/* Connected Accounts */}
      <section className="space-y-4">
        <h2 className="font-semibold">Connected accounts</h2>
        <div className="space-y-4">
          {accounts.map((account) => (
            <ConnectedAccountItem
              key={account.id}
              account={account}
              email={authSession.user.email}
            />
          ))}
        </div>
      </section>

      <Separator />

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
          {listSessions.map((session) => (
            <SessionItem
              key={session.token}
              session={session}
              currentSessionToken={authSession.session.token}
            />
          ))}
        </div>
        {listSessions.length > 1 && <RevokeOtherSessions />}
      </section>

      <Separator />

      {/* Delete Account */}
      <DeleteAccount />
    </div>
  );
}
