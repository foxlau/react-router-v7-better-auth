import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const fetcher = useFetcher({ key: "delete-account" });
  const isPending = fetcher.state !== "idle";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          {t("common.delete")}
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
              {t("account.confirmation")}
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {t("account.confirmationWarn")}{" "}
              <span className="text-foreground">{email}</span>.
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
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <LoadingButton
              buttonText={t("common.delete")}
              loadingText={t("common.deleting")}
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
  const { t } = useTranslation();
  const signOutFetcher = useFetcher();
  const signOutIsPending = signOutFetcher.state !== "idle";

  return (
    <LoadingButton
      buttonText={t("auth.signOut")}
      loadingText={t("auth.signingOut")}
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
