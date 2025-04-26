import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, data, redirect } from "react-router";
import { toast } from "sonner";

import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useIsPending } from "~/hooks/use-is-pending";
import { authClient } from "~/lib/auth/auth.client";
import { resetPasswordSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/reset-password";

export const meta: Route.MetaFunction = () => [{ title: "Password Reset" }];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return redirect("/auth/sign-in");
  return data({ token });
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: resetPasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { error } = await authClient.resetPassword({
    newPassword: submission.value.newPassword,
    token: submission.value.token,
  });

  if (error) {
    return toast.error(error.message || "An unexpected error occurred.");
  }

  toast.success("Password reset successfully! Please sign in again.");
  return redirect("/auth/sign-in");
}

export default function ResetPassword({
  loaderData: { token },
}: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: resetPasswordSchema });
    },
    constraint: getZodConstraint(resetPasswordSchema),
    shouldRevalidate: "onInput",
  });

  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-bold text-2xl">Reset your password</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your new password below, minimum 8 characters, maximum 32
          characters.
        </p>
      </div>

      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <input type="hidden" name="token" value={token} />
        <div className="grid gap-2">
          <Label htmlFor={fields.newPassword.id}>New Password</Label>
          <Input
            autoComplete="new-password"
            {...getInputProps(fields.newPassword, { type: "password" })}
          />
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
          {isPending && <Spinner />} Reset Password
        </Button>
      </Form>

      <div className="text-center text-sm">
        <Link to="/auth/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
