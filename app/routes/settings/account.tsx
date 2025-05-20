import { parseWithZod } from "@conform-to/zod";
import { dataWithError, dataWithSuccess } from "remix-toast";

import { useTranslation } from "react-i18next";
import AvatarCropper from "~/components/avatar-cropper";
import { DeleteAccount, SignOut } from "~/components/settings/account-action";
import { SettingRow } from "~/components/settings/setting-row";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { useAuthUser } from "~/hooks/use-auth-user";
import { deleteUserImageFromR2, serverAuth } from "~/lib/auth/auth.server";
import { AppInfo } from "~/lib/config";
import { adapterContext, authSessionContext } from "~/lib/contexts";
import { getAvatarUrl } from "~/lib/utils";
import { accountSchema } from "~/lib/validations/settings";
import { getInstance } from "~/middlewares/i18next";
import type { Route } from "./+types/account";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Account - ${AppInfo.name}` }];
};

export async function action({ request, context }: Route.ActionArgs) {
  const { t } = getInstance(context);
  try {
    const formData = await request.clone().formData();
    const submission = parseWithZod(formData, { schema: accountSchema });

    if (submission.status !== "success") {
      return dataWithError(null, t("errors.invalidData"));
    }

    const auth = serverAuth();
    const headers = request.headers;
    const { cloudflare } = context.get(adapterContext);
    const { user } = context.get(authSessionContext);
    const { intent } = submission.value;
    let message = "";

    switch (intent) {
      case "delete-account":
        await Promise.all([
          auth.api.revokeSessions({ headers }),
          auth.api.deleteUser({ body: {}, asResponse: false, headers }),
        ]);
        message = t("account.deleted");
        break;

      case "delete-avatar": {
        if (!user.image) {
          return dataWithError(null, t("account.noAvatar"));
        }

        await Promise.all([
          deleteUserImageFromR2(user.image),
          auth.api.updateUser({
            body: { image: undefined },
            asResponse: false,
            headers,
          }),
        ]);
        message = t("account.avatarDeleted");
        break;
      }

      case "set-avatar": {
        const image = submission.value.image;
        const fileExtension = image.type.split("/")[1];
        const objectName = `user-avatar/${user.id}.${fileExtension}`;
        const timestamp = Date.now();
        const imagePath = `${objectName}?v=${timestamp}`; // add timestamp to avoid cache

        await Promise.all([
          cloudflare.env.R2.put(objectName, image, {
            httpMetadata: { contentType: image.type },
          }),
          auth.api.updateUser({
            body: { image: imagePath },
            asResponse: true,
            headers,
          }),
        ]);
        message = t("account.avatarUpdated");
        break;
      }

      default:
        return dataWithError(null, t("errors.invalidIntent"));
    }

    return dataWithSuccess(null, message);
  } catch (error) {
    console.error("Account action error:", error);
    return dataWithError(null, t("errors.unexpected"));
  }
}

export default function AccountRoute() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const { avatarUrl, placeholderUrl } = getAvatarUrl(user.image, user.name);

  return (
    <SettingsLayout title={t("account.title")}>
      <SettingRow
        title={t("account.avatar")}
        description={t("account.description")}
        action={
          <AvatarCropper
            avatarUrl={avatarUrl}
            placeholderUrl={placeholderUrl}
          />
        }
      />
      <SettingRow
        title={t("account.nameEmail")}
        description={`${user.name}, ${user.email}`}
      />
      <SettingRow
        title={t("account.currentSignIn")}
        description={`${t("account.signInAs")} ${user.email}`}
        action={<SignOut />}
      />
      <SettingRow
        title={t("account.deleteAccount")}
        description={t("account.permanentlyDeleteAccount")}
        action={<DeleteAccount email={user.email} />}
      />
    </SettingsLayout>
  );
}
