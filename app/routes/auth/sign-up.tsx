import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, redirect } from "react-router";
import { toast } from "sonner";

import { Trans, getI18n, useTranslation } from "react-i18next";
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
  const { t } = getI18n();
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
    return toast.error(error.message || t("errors.unexpected"));
  }

  toast.success(t("auth.signingUpSuccess"));
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

  const { t } = useTranslation();
  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <AuthLayout
      title={t("auth.signUpTitle")}
      description={t("auth.signUpWelcome")}
    >
      {/* Sign up form */}
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <InputField
          labelProps={{ children: t("user.name") }}
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
          labelProps={{ children: t("user.email") }}
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: "johndoe@example.com",
            autoComplete: "email",
            enterKeyHint: "next",
          }}
          errors={fields.email.errors}
        />
        <PasswordField
          labelProps={{ children: t("user.password") }}
          inputProps={{
            ...getInputProps(fields.password, { type: "password" }),
            placeholder: t("auth.enterPassword"),
            autoComplete: "password",
            enterKeyHint: "done",
          }}
          errors={fields.password.errors}
        />
        <LoadingButton
          buttonText={t("auth.signUp")}
          loadingText={t("auth.signingUp")}
          isPending={isPending}
        />
      </Form>

      {/* Terms of service */}
      <div className="text-balance text-center text-muted-foreground text-xs">
        <Trans
          i18nKey="auth.serviceAndPolicy"
          components={[
            // biome-ignore lint/a11y/useAnchorContent: <explanation>
            <a
              key="termsOfService"
              href="/"
              className="text-primary hover:underline"
            />,
            // biome-ignore lint/a11y/useAnchorContent: <explanation>
            <a
              key="privacyPolicy"
              href="/"
              className="text-primary hover:underline"
            />,
          ]}
        />
      </div>

      {/* Sign in */}
      <div className="text-center text-sm">
        {t("auth.haveAccount")}{" "}
        <Link to="/auth/sign-in" className="text-primary hover:underline">
          {t("auth.signIn")}
        </Link>
      </div>
    </AuthLayout>
  );
}
