import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, href, redirect, useNavigation } from "react-router";
import { toast } from "sonner";

import { Trans, useTranslation } from "react-i18next";
import { AuthLayout } from "~/components/auth-layout";
import { InputField, LoadingButton, PasswordField } from "~/components/forms";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth/auth.client";
import { SOCIAL_PROVIDER_CONFIGS } from "~/lib/config";
import { AppInfo } from "~/lib/config";
import { filterLocale } from "~/lib/i18n";
import { signInSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/sign-in";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Sign In - ${AppInfo.name}` }];
};

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, { schema: signInSchema });

  if (submission.status !== "success") {
    return toast.error("Invalid form data.");
  }

  switch (submission.value.provider) {
    case "sign-in": {
      const { email, password } = submission.value;
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        return toast.error(error.message || "Sign in failed.");
      }
      break;
    }

    case "github":
    case "google": {
      const { provider } = submission.value;
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/home",
      });
      if (error) {
        return toast.error(error.message || `${provider} sign in failed.`);
      }
      break;
    }

    default:
      return toast.error("Invalid login method.");
  }

  return redirect("/home");
}

export default function SignInRoute() {
  const { i18n, t } = useTranslation();
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
  const isSignInPending = isPending("sign-in");

  return (
    <AuthLayout
      title={t("auth.signInTitle")}
      description="Welcome back! Please sign in to continue."
    >
      {/* Sign in form */}
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <InputField
          labelProps={{ children: "Email" }}
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: "john@doe.com",
            autoComplete: "email",
            enterKeyHint: "next",
          }}
          errors={fields.email.errors}
        />
        <PasswordField
          labelProps={{
            className: "flex items-center justify-between",
            children: (
              <>
                <span>Password</span>
                <Link
                  to={href(
                    "/:lang?/auth/forget-password",
                    filterLocale(i18n.language),
                  )}
                  className="font-normal text-muted-foreground hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </>
            ),
          }}
          inputProps={{
            ...getInputProps(fields.password, { type: "password" }),
            placeholder: "••••••••••",
            autoComplete: "current-password",
            enterKeyHint: "done",
          }}
          errors={fields.password.errors}
        />
        <input type="hidden" name="provider" value="sign-in" />
        <LoadingButton
          buttonText={t("auth.signIn")}
          loadingText="Signing in..."
          isPending={isSignInPending}
        />
      </Form>

      <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>

      {/* Social login */}
      {SOCIAL_PROVIDER_CONFIGS.length > 0 && (
        <div className="grid gap-2">
          {SOCIAL_PROVIDER_CONFIGS.map(({ id, name, icon: Icon }) => (
            <Form key={id} method="post">
              <input type="hidden" name="provider" value={id} />
              <Button
                variant="outline"
                className="w-full"
                disabled={isPending(id)}
              >
                <Icon className="size-4" />
                <span>
                  <Trans
                    i18nKey="auth.signInWith"
                    values={{ name }}
                    components={[<span key={id} className="capitalize" />]}
                  />
                </span>
              </Button>
            </Form>
          ))}
        </div>
      )}

      {/* Sign up */}
      <div className="text-center text-sm">
        {t("auth.noAccount")}{" "}
        <Link
          to={href("/:lang?/auth/sign-up", filterLocale(i18n.language))}
          className="text-primary hover:underline"
        >
          {t("auth.signUp")}
        </Link>
      </div>
    </AuthLayout>
  );
}
