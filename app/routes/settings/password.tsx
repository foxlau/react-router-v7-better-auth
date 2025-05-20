import { parseWithZod } from "@conform-to/zod";
import { getI18n, useTranslation } from "react-i18next";
import { Link, href } from "react-router";
import { toast } from "sonner";
import { ChangePassword } from "~/components/settings/password-action";
import { SettingRow } from "~/components/settings/setting-row";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { buttonVariants } from "~/components/ui/button";
import { authClient } from "~/lib/auth/auth.client";
import { AppInfo } from "~/lib/config";
import { cn } from "~/lib/utils";
import { changePasswordSchema } from "~/lib/validations/auth";
import type { Route } from "./+types/password";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Password - ${AppInfo.name}` }];
};

export async function clientAction({ request }: Route.ClientActionArgs) {
  const { t } = getI18n();

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: changePasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const result = await authClient.changePassword({
    newPassword: submission.value.newPassword,
    currentPassword: submission.value.currentPassword,
    revokeOtherSessions: true,
  });

  if (result.error) {
    toast.error(result.error.message || t("errors.unexpected"));
    return { status: "error" };
  }

  toast.success(t("password.change.success"));
  return { status: "success" };
}

export default function ChangePasswordRoute() {
  const { t } = useTranslation();

  return (
    <SettingsLayout title={t("password.title")}>
      <SettingRow
        title={t("password.change.title")}
        description={t("password.change.description")}
        action={<ChangePassword />}
      />
      <SettingRow
        title={t("password.reset.title")}
        description={t("password.reset.description")}
        action={
          <Link
            target="_blank"
            to={href("/auth/forget-password")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {t("password.reset.title")} ↗
          </Link>
        }
      />
    </SettingsLayout>
  );
}
