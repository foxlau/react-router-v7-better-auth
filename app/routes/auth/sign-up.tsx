import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, redirect } from "react-router";
import { toast } from "sonner";

import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useIsPending } from "~/hooks/use-is-pending";
import { authClient } from "~/lib/auth/auth.client";
import { signUpSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/sign-up";

export const meta: Route.MetaFunction = () => [{ title: "Sign Up" }];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signUpSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { error } = await authClient.signUp.email({
    callbackURL: "/dashboard",
    ...submission.value,
  });

  if (error) {
    return toast.error(error.message || "An unexpected error occurred.");
  }

  toast.success(
    "Sign up successful! Please check your email for a verification link.",
  );
  return redirect("/auth/sign-in");
}

export default function SignUp() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signUpSchema });
    },
    constraint: getZodConstraint(signUpSchema),
    shouldRevalidate: "onInput",
  });

  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Login title */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-bold text-2xl">Create your account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Welcome! Please fill in the details to get started.
        </p>
      </div>

      {/* Sign up form */}
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <div className="grid gap-2">
          <Label htmlFor={fields.name.id}>Name</Label>
          <Input
            placeholder="John Doe"
            autoComplete="name"
            required
            {...getInputProps(fields.name, { type: "text" })}
          />
          {fields.name.errors && (
            <p
              className="text-destructive text-xs"
              role="alert"
              aria-live="polite"
            >
              {fields.name.errors.join(", ")}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fields.email.id}>Email</Label>
          <Input
            placeholder="johndoe@example.com"
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
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fields.password.id}>Password</Label>
          <Input
            placeholder="Enter a unique password"
            autoComplete="current-password"
            {...getInputProps(fields.password, { type: "password" })}
          />
          {fields.password.errors && (
            <p
              className="text-destructive text-xs"
              role="alert"
              aria-live="polite"
            >
              {fields.password.errors.join(", ")}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Spinner />} Sign Up
        </Button>
      </Form>

      {/* Terms of service */}
      <div className="text-balance text-center text-muted-foreground text-xs">
        By clicking continue, you agree to our{" "}
        <a href="/" className="text-primary hover:underline">
          Terms of Service
        </a>
        {" and "}
        <a href="/" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </div>

      {/* Sign in */}
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
