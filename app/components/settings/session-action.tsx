import { CircleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import type { clientAction } from "~/routes/settings/sessions";
import { LoadingButton } from "../forms";

export function SignOutOfOtherSessions() {
  const fetcher = useFetcher<typeof clientAction>({
    key: "sign-out-of-other-sessions",
  });
  const isPending = fetcher.state !== "idle";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.status === "success") {
      setOpen(false);
    }
  }, [fetcher.data]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Sign out of other sessions</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of other sessions? This will
              sign you out of all sessions except the current one.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <fetcher.Form method="post" action=".">
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <LoadingButton
              buttonText="Sign out"
              loadingText="Signing out..."
              isPending={isPending}
            />
          </AlertDialogFooter>
        </fetcher.Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
