import { Monitor, Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";

import type { authClient } from "~/auth/auth.client";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { useDoubleCheck } from "~/hooks/use-double-check";
import { useHydrated } from "~/hooks/use-hydrated";
import { formatDate, parseUserAgent } from "~/lib/utils";

interface SessionItemProps {
  session: typeof authClient.$Infer.Session.session;
  currentSessionToken: string;
}

export function SessionItem({
  session,
  currentSessionToken,
}: SessionItemProps) {
  const hydrated = useHydrated();
  const { system, browser, isMobile } = parseUserAgent(session.userAgent || "");
  const isCurrentSession = session.token === currentSessionToken;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {isMobile ? (
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Monitor className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono">
              {system}
              <small className="mx-1 text-muted-foreground">•</small>
              {browser}
            </span>
            {isCurrentSession && (
              <span className="rounded-xl border px-1 text-xs text-primary">
                Current device
              </span>
            )}
          </div>

          <div className="space-x-2 text-xs text-muted-foreground">
            <span>IP: {session.ipAddress || "unknown"}</span>
            {!hydrated ? null : (
              <span>Last active: {formatDate(session.createdAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RevokeOtherSessions() {
  const fetcher = useFetcher();
  const { doubleCheck, setDoubleCheck, getButtonProps } = useDoubleCheck();

  const isPending =
    fetcher.formData?.get("intent") === "revokeOtherSessions" &&
    fetcher.state !== "idle";

  useEffect(() => {
    if (isPending) {
      setDoubleCheck(false);
    }
  }, [isPending, setDoubleCheck]);

  return (
    <fetcher.Form method="post" action="/dashboard">
      <Button
        type="submit"
        name="intent"
        value="revokeOtherSessions"
        size="sm"
        variant="outline"
        disabled={isPending}
        {...getButtonProps()}
      >
        {isPending && <Spinner />}
        {doubleCheck ? "Are you sure?" : "Sign out other browser sessions"}
      </Button>
    </fetcher.Form>
  );
}
