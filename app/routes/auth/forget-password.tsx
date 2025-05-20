import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getI18n, useTranslation } from "react-i18next";
import { Form, Link } from "react-router";
import { toast } from "sonner";
import { AuthLayout } from "~/components/auth-layout";
import { InputField, LoadingButton } from "~/components/forms";
import { useIsPending } from "~/hooks/use-is-pending";
import { authClient } from "~/lib/auth/auth.client";
import { AppInfo } from "~/lib/config";
import { forgetPasswordSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/forget-password";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Forgot your password? - ${AppInfo.name}` }];
};

export async function clientAction({ request }: Route.ClientActionArgs) {
  const { t } = getI18n();
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
    ? toast.error(error.message || t("errors.unexpected"))
    : toast.success(t("auth.sentLinkSuccess"));
}

export default function ForgetPasswordRoute() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: forgetPasswordSchema });
    },
    constraint: getZodConstraint(forgetPasswordSchema),
    shouldRevalidate: "onInput",
  });

  const { t } = useTranslation();
  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <AuthLayout
      title={t("auth.forgotPasswordTitle")}
      description={t("auth.forgotPasswordDescription")}
    >
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <InputField
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: t("auth.enterEmail"),
            autoComplete: "email",
          }}
          errors={fields.email.errors}
        />
        <LoadingButton
          buttonText={t("auth.sendResetLink")}
          loadingText={t("auth.sendingResetLink")}
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
