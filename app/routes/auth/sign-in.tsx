import { Form, Link, redirect } from "react-router";
import { toast } from "sonner";

import { signIn } from "~/auth/auth.client";
import { GithubIcon, GoogleIcon } from "~/components/icons";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useIsPending } from "~/hooks/use-is-pending";
import type { Route } from "./+types/sign-in";

export const meta: Route.MetaFunction = () => [{ title: "Sign In" }];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const intent = formData.get("intent") as string;
  let data = null;

  switch (intent) {
    case "sign-in":
      data = await signIn.email({ email, password });
      break;
    case "github":
    case "google":
      data = await signIn.social({
        provider: intent,
        callbackURL: "/dashboard",
      });
      break;
    default:
      toast.error("Invalid intent");
      return;
  }

  if (data?.error) {
    return toast.error(data?.error?.message);
  }

  return redirect("/dashboard");
}

export default function SignIn() {
  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Login title */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      {/* Sign in form */}
      <Form method="post" className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@doe.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/auth/forget-password"
              className="ml-auto text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••••"
            autoComplete="current-password"
            required
          />
        </div>
        <Button
          name="intent"
          value="sign-in"
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Spinner /> Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </Form>

      <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>

      {/* Social login */}
      <div className="grid gap-2">
        {/* GitHub */}
        <Form method="post">
          <Button
            name="intent"
            value="github"
            variant="outline"
            className="w-full"
            disabled={isPending}
          >
            <GithubIcon className="size-4" />
            Login with GitHub
          </Button>
        </Form>

        {/* Google */}
        <Form method="post">
          <Button
            name="intent"
            value="google"
            variant="outline"
            className="w-full"
            disabled={isPending}
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
