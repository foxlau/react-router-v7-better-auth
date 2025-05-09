import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useEffect, useState } from "react";
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
import { changePasswordSchema } from "~/lib/validations/auth";
import type { clientAction } from "~/routes/settings/password";
import { LoadingButton, PasswordField } from "../forms";

export function ChangePassword() {
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
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Make changes to your password here. You can change your password and
            set a new password.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          action="." // Ensure action posts to the current route's clientAction
          className="space-y-4"
          {...getFormProps(form)}
        >
          <PasswordField
            labelProps={{ children: "Current Password" }}
            inputProps={{
              ...getInputProps(fields.currentPassword, { type: "password" }),
            }}
            errors={fields.currentPassword.errors}
          />
          <PasswordField
            labelProps={{ children: "New Password" }}
            inputProps={{
              ...getInputProps(fields.newPassword, { type: "password" }),
            }}
            errors={fields.newPassword.errors}
          />
          <PasswordField
            labelProps={{ children: "Confirm New Password" }}
            inputProps={{
              ...getInputProps(fields.confirmPassword, { type: "password" }),
            }}
            errors={fields.confirmPassword.errors}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <LoadingButton
              buttonText="Save changes"
              loadingText="Saving..."
              isPending={isPending}
            />
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
