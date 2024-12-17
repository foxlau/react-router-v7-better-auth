import { Form, Link, redirect } from "react-router";
import { toast } from "sonner";

import { signUp } from "~/auth/auth.client";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useIsPending } from "~/hooks/use-is-pending";
import { isValidEmailFormat } from "~/lib/utils";
import type { Route } from "./+types/sign-up";

export const meta: Route.MetaFunction = () => [{ title: "Sign Up" }];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!isValidEmailFormat(email)) {
    return toast.error("Invalid email format.");
  }

  if (name.length < 3) {
    return toast.error("Name must be at least 3 characters long.");
  }

  if (password.length <= 8 || password.length > 32) {
    return toast.error("Password must be between 8 and 32 characters long.");
  }

  const { error } = await signUp.email({
    email: email.trim().toLowerCase(),
    name: name.trim(),
    password: password.trim(),
    callbackURL: "/dashboard",
  });

  if (error) {
    return toast.error(error.message);
  }

  toast.success(
    "Sign up successful! Please check your email for a verification link.",
  );
  return redirect("/auth/sign-in");
}

export default function SignUp() {
  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Login title */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Welcome! Please fill in the details to get started.
        </p>
      </div>

      {/* Sign up form */}
      <Form method="post" className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="johndoe@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter a unique password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner /> Signing up...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
      </Form>

      {/* Terms of service */}
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="/">Terms of Service</a>{" "}
        and <a href="/">Privacy Policy</a>.
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
