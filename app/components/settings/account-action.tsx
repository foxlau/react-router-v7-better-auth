import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { LoadingButton } from "../forms";

export function DeleteAccount({ email }: { email: string }) {
  const [inputValue, setInputValue] = useState("");
  const fetcher = useFetcher({ key: "delete-account" });
  const isPending = fetcher.state !== "idle";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Final confirmation
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              This action cannot be undone. To confirm, please enter the email
              address <span className="text-foreground">{email}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <fetcher.Form method="post" action="?index" className="space-y-5">
          <div className="*:not-first:mt-2">
            <Input
              type="text"
              name="email"
              placeholder={`Type ${email} to confirm`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <input type="hidden" name="intent" value="delete-account" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <LoadingButton
              buttonText="Delete"
              loadingText="Deleting..."
              isPending={isPending}
              variant="destructive"
              className="flex-1"
              disabled={inputValue !== email || isPending}
            />
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export function SignOut() {
  const signOutFetcher = useFetcher();
  const signOutIsPending = signOutFetcher.state !== "idle";

  return (
    <LoadingButton
      buttonText="Sign out"
      loadingText="Signing out..."
      isPending={signOutIsPending}
      variant="outline"
      size="sm"
      onClick={() =>
        signOutFetcher.submit(null, {
          method: "POST",
          action: "/auth/sign-out",
        })
      }
    />
  );
}
