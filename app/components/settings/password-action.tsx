import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useEffect, useState } from "react";
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
import { changePasswordSchema } from "~/lib/validations/auth";
import type { clientAction } from "~/routes/settings/password";
import { LoadingButton, PasswordField } from "../forms";

export function ChangePassword() {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof clientAction>({ key: "change-password" });
  const isPending = fetcher.state !== "idle";
  const [open, setOpen] = useState(false);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: changePasswordSchema });
    },
    constraint: getZodConstraint(changePasswordSchema),
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (fetcher.data?.status === "success") {
      setOpen(false);
    }
  }, [fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("password.change.title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("password.change.title")}</DialogTitle>
          <DialogDescription>{t("password.change.action")}</DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          action="." // Ensure action posts to the current route's clientAction
          className="space-y-4"
          {...getFormProps(form)}
        >
          <PasswordField
            labelProps={{ children: t("user.currentPassword") }}
            inputProps={{
              ...getInputProps(fields.currentPassword, { type: "password" }),
              autoComplete: "current-password",
              enterKeyHint: "next",
            }}
            errors={fields.currentPassword.errors}
          />
          <PasswordField
            labelProps={{ children: t("user.newPassword") }}
            inputProps={{
              ...getInputProps(fields.newPassword, { type: "password" }),
              autoComplete: "new-password",
              enterKeyHint: "next",
            }}
            errors={fields.newPassword.errors}
          />
          <PasswordField
            labelProps={{ children: t("user.confirmPassword") }}
            inputProps={{
              ...getInputProps(fields.confirmPassword, { type: "password" }),
              autoComplete: "confirm-password",
              enterKeyHint: "done",
            }}
            errors={fields.confirmPassword.errors}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <LoadingButton
              buttonText={t("common.save")}
              loadingText={t("common.saving")}
              isPending={isPending}
            />
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
