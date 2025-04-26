import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, redirect, useNavigation } from "react-router";
import { toast } from "sonner";

import { GithubIcon, GoogleIcon } from "~/components/icons";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth/auth.client";
import { signInSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/sign-in";

export const meta: Route.MetaFunction = () => [{ title: "Sign In" }];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, { schema: signInSchema });

  if (submission.status !== "success") {
    return toast.error("Invalid form data");
  }

  switch (submission.value.provider) {
    case "sign-in": {
      const { email, password } = submission.value;
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        return toast.error(error.message || "Sign in failed");
      }
      break;
    }

    case "github":
    case "google": {
      const { provider } = submission.value;
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
      if (error) {
        return toast.error(error.message || `${provider} sign in failed`);
      }
      break;
    }

    default:
      return toast.error("Invalid login method");
  }

  return redirect("/dashboard");
}

export default function SignIn() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signInSchema });
    },
    constraint: getZodConstraint(signInSchema),
    shouldRevalidate: "onInput",
  });

  const navigation = useNavigation();
  const isPending = (provider: string) =>
    navigation.formData?.get("provider") === provider &&
    navigation.state !== "idle";

  return (
    <div className="flex flex-col gap-6">
      {/* Login title */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-semibold text-2xl">Sign in to your account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      {/* Sign in form */}
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <div className="grid gap-2">
          <Label htmlFor={fields.email.id}>Email</Label>
          <Input
            placeholder="john@doe.com"
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
          <div className="flex items-center">
            <Label htmlFor={fields.password.id}>Password</Label>
            <Link
              to="/auth/forget-password"
              className="ml-auto text-primary text-sm hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            placeholder="••••••••••"
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
        <input type="hidden" name="provider" value="sign-in" />
        <Button
          type="submit"
          className="w-full"
          disabled={isPending("sign-in")}
        >
          {isPending("sign-in") && <Spinner />} Sign In
        </Button>
      </Form>

      <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>

      {/* Social login */}
      <div className="grid gap-2">
        {/* GitHub */}
        <Form method="post">
          <input type="hidden" name="provider" value="github" />
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending("github")}
          >
            <GithubIcon className="size-4" />
            Login with GitHub
          </Button>
        </Form>

        {/* Google */}
        <Form method="post">
          <input type="hidden" name="provider" value="google" />
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending("google")}
          >
            <GoogleIcon className="size-4" />
            Login with Google
          </Button>
        </Form>
      </div>

      {/* Sign up */}
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/auth/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
