import { Suspense } from "react";
import { Await, data, useNavigate } from "react-router";
import { toast } from "sonner";

import { getI18n, useTranslation } from "react-i18next";
import { SignOutOfOtherSessions } from "~/components/settings/session-action";
import { SessionItem } from "~/components/settings/session-item";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuthUser } from "~/hooks/use-auth-user";
import { authClient } from "~/lib/auth/auth.client";
import { serverAuth } from "~/lib/auth/auth.server";
import { AppInfo } from "~/lib/config";
import type { Route } from "./+types/sessions";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Sessions - ${AppInfo.name}` }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const auth = serverAuth();
  const listSessions = auth.api.listSessions({ headers: request.headers });
  return data({ listSessions });
}

export async function clientAction(_: Route.ClientActionArgs) {
  const { t } = getI18n();

  const { error } = await authClient.revokeOtherSessions();
  if (error) {
    toast.error(error.message || t("errors.unexpected"));
    return { status: "error" };
  }

  toast.success(t("sessions.otherSignedOut"));
  return { status: "success" };
}

export default function SessionsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { session } = useAuthUser();
  const navigate = useNavigate();

  return (
    <SettingsLayout
      title={t("sessions.title")}
      description={t("sessions.description")}
    >
      <div className="py-4">
        <Suspense
          fallback={
            <div className="divide-y rounded-lg border shadow-xs">
              <div className="flex flex-col gap-2 px-4 py-3">
                <Skeleton className="h-4 w-6/12" />
                <Skeleton className="h-4 w-8/12" />
              </div>
              <div className="flex flex-col gap-2 px-4 py-3">
                <Skeleton className="h-4 w-8/12" />
                <Skeleton className="h-4 w-10/12" />
              </div>
            </div>
          }
        >
          <Await
            resolve={loaderData.listSessions}
            errorElement={
              <div className="flex items-center justify-between rounded-lg border px-4 py-3 shadow-xs">
                <p>{t("errors.loadingSessions")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate(0);
                  }}
                >
                  {t("common.refresh")}
                </Button>
              </div>
            }
          >
            {(resolvedSessions) => (
              <div className="space-y-4">
                <div className="divide-y rounded-lg border shadow-xs">
                  {resolvedSessions.length === 0 ? (
                    <div className="px-4 py-3">{t("sessions.noSessions")}</div>
                  ) : (
                    resolvedSessions.map((item) => (
                      <SessionItem
                        key={item.token}
                        session={item}
                        currentSessionToken={session.token}
                      />
                    ))
                  )}
                </div>
                {resolvedSessions.length > 1 && <SignOutOfOtherSessions />}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </SettingsLayout>
  );
}
