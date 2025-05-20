import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, data, redirect } from "react-router";
import { toast } from "sonner";

import { getI18n, useTranslation } from "react-i18next";
import { AuthLayout } from "~/components/auth-layout";
import { LoadingButton, PasswordField } from "~/components/forms";
import { useIsPending } from "~/hooks/use-is-pending";
import { authClient } from "~/lib/auth/auth.client";
import { AppInfo } from "~/lib/config";
import { resetPasswordSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/reset-password";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Password Reset - ${AppInfo.name}` }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return redirect("/auth/sign-in");
  return data({ token });
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const { t } = getI18n();
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
    return toast.error(error.message || t("errors.unexpected"));
  }

  toast.success(t("password.reset.success"));
  return redirect("/auth/sign-in");
}

export default function ResetPasswordRoute({
  loaderData: { token },
}: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: resetPasswordSchema });
    },
    constraint: getZodConstraint(resetPasswordSchema),
    shouldRevalidate: "onInput",
  });

  const { t } = useTranslation();
  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <AuthLayout
      title={t("auth.resetPasswordTitle")}
      description={t("auth.resetPasswordDescription")}
    >
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <input type="hidden" name="token" value={token} />
        <PasswordField
          labelProps={{ children: t("auth.newPassword") }}
          inputProps={{
            ...getInputProps(fields.newPassword, { type: "password" }),
          }}
          errors={fields.newPassword.errors}
        />
        <PasswordField
          labelProps={{ children: t("auth.confirmPassword") }}
          inputProps={{
            ...getInputProps(fields.confirmPassword, { type: "password" }),
          }}
          errors={fields.confirmPassword.errors}
        />
        <LoadingButton
          buttonText={t("auth.resetPassword")}
          loadingText={t("auth.resettingPassword")}
          isPending={isPending}
        />
      </Form>

      <div className="text-center text-sm">
        <Link to="/auth/sign-in" className="text-primary hover:underline">
          ← {t("auth.backSignIn")}
        </Link>
      </div>
    </AuthLayout>
  );
}
