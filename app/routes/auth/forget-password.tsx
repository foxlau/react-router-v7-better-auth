import { Form, Link } from "react-router";
import { toast } from "sonner";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useIsPending } from "~/hooks/use-is-pending";
import { authClient } from "~/lib/auth/auth.client";
import { forgetPasswordSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/forget-password";

export const meta: Route.MetaFunction = () => [
  { title: "Forgot your password?" },
];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: forgetPasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { error } = await authClient.forgetPassword({
    email: submission.value.email,
    redirectTo: "/auth/reset-password",
  });

  return error
    ? toast.error(error.message || "An unexpected error occurred.")
    : toast.success("Password reset link sent to your email!");
}

export default function ForgetPassword() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: forgetPasswordSchema });
    },
    constraint: getZodConstraint(forgetPasswordSchema),
    shouldRevalidate: "onInput",
  });

  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-bold text-2xl">Forgot your password?</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your email address and we will send you a password reset link.
        </p>
      </div>

      <Form method="post" className="grid gap-2" {...getFormProps(form)}>
        <Input
          placeholder="Enter your email"
          autoComplete="email"
          {...getInputProps(fields.email, { type: "email" })}
        />
        {fields.email.errors && (
          <p
            className="text-destructive text-xs"
            role="alert"
            aria-live="polite"
          >
            {fields.email.errors.join(", ")}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Spinner />} Send reset link
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
