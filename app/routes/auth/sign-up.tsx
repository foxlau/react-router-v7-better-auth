import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, redirect } from "react-router";
import { toast } from "sonner";

import { AuthLayout } from "~/components/auth-layout";
import { InputField, LoadingButton, PasswordField } from "~/components/forms";
import { useIsPending } from "~/hooks/use-is-pending";
import { authClient } from "~/lib/auth/auth.client";
import { AppInfo } from "~/lib/config";
import { signUpSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/sign-up";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Sign Up - ${AppInfo.name}` }];
};

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signUpSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { error } = await authClient.signUp.email({
    callbackURL: "/home",
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

export default function SignUpRoute() {
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
    <AuthLayout
      title="Create your account"
      description="Welcome! Please fill in the details to get started."
    >
      {/* Sign up form */}
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <InputField
          labelProps={{ children: "Name" }}
          inputProps={{
            ...getInputProps(fields.name, { type: "text" }),
            placeholder: "John Doe",
            autoComplete: "name",
            enterKeyHint: "next",
            required: true,
          }}
          errors={fields.name.errors}
        />
        <InputField
          labelProps={{ children: "Email" }}
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: "johndoe@example.com",
            autoComplete: "email",
            enterKeyHint: "next",
          }}
          errors={fields.email.errors}
        />
        <PasswordField
          labelProps={{ children: "Password" }}
          inputProps={{
            ...getInputProps(fields.password, { type: "password" }),
            placeholder: "Enter a unique password",
            autoComplete: "password",
            enterKeyHint: "done",
          }}
          errors={fields.password.errors}
        />
        <LoadingButton
          buttonText="Sign Up"
          loadingText="Signing up..."
          isPending={isPending}
        />
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
    </AuthLayout>
  );
}
