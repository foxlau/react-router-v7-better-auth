import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "react-router";
import { toast } from "sonner";

import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useIsPending } from "~/hooks/use-is-pending";
import { authClient } from "~/lib/auth/auth.client";
import { changePasswordSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/change-password";

export const meta = () => [{ title: "Change Password" }];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: changePasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const result = await authClient.changePassword({
    newPassword: submission.value.newPassword,
    currentPassword: submission.value.currentPassword,
    revokeOtherSessions: true,
  });

  if (result.error) {
    return toast.error(result.error.message || "An unexpected error occurred.");
  }

  toast.success("Password changed successfully! Other sessions revoked.");
  return null;
}

export default function ChangePassword(_: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: changePasswordSchema });
    },
    constraint: getZodConstraint(changePasswordSchema),
    shouldRevalidate: "onInput",
  });

  const isPending = useIsPending({
    formAction: "/change-password",
    formMethod: "POST",
  });

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="font-semibold text-base capitalize">Change Password</h1>
        <p className="text-foreground/70">
          New password minimum 8 characters long, maximum 32 characters long,
          and cannot be the same as the current password.
        </p>
      </section>

      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <div className="grid gap-2">
          <Label htmlFor={fields.currentPassword.id}>Current Password</Label>
          <Input
            autoComplete="current-password"
            {...getInputProps(fields.currentPassword, { type: "password" })}
          />
          {fields.currentPassword.errors && (
            <p
              className="text-destructive text-xs"
              role="alert"
              aria-live="polite"
            >
              {fields.currentPassword.errors.join(", ")}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fields.newPassword.id}>New Password</Label>
          <Input {...getInputProps(fields.newPassword, { type: "password" })} />
          {fields.newPassword.errors && (
            <p
              className="text-destructive text-xs"
              role="alert"
              aria-live="polite"
            >
              {fields.newPassword.errors.join(", ")}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fields.confirmPassword.id}>
            Confirm new password
          </Label>
          <Input
            {...getInputProps(fields.confirmPassword, { type: "password" })}
          />
          {fields.confirmPassword.errors && (
            <p
              className="text-destructive text-xs"
              role="alert"
              aria-live="polite"
            >
              {fields.confirmPassword.errors.join(", ")}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner /> Changing password...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </Form>

      <hr />

      <section className="space-y-2">
        <h2 className="font-semibold">Note</h2>
        <p className="text-foreground/70">
          If the user signed up using OAuth or another provider, they will not
          have a password or credentials for their account. It is recommended
          that the user go through the "forgot password" flow to set a password
          for their account.{" "}
          <a
            href="https://www.better-auth.com/docs/concepts/users-accounts#set-password"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Learn more
          </a>
        </p>
      </section>
    </div>
  );
}
