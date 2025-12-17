import { parseWithZod } from "@conform-to/zod";
import { dataWithError, dataWithSuccess } from "remix-toast";

import AvatarCropper from "~/components/avatar-cropper";
import { DeleteAccount, SignOut } from "~/components/settings/account-action";
import { SettingRow } from "~/components/settings/setting-row";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { useAuthUser } from "~/hooks/use-auth-user";
import { deleteUserImageFromR2, serverAuth } from "~/lib/auth/auth.server";
import { AppInfo } from "~/lib/config";
import { getAvatarUrl } from "~/lib/utils";
import { accountSchema } from "~/lib/validations/settings";
import { requireUser } from "~/middlewares/auth-guard";
import type { Route } from "./+types/account";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Account - ${AppInfo.name}` }];
};

export async function action({ request, context }: Route.ActionArgs) {
  try {
    const formData = await request.clone().formData();
    const submission = parseWithZod(formData, { schema: accountSchema });

    if (submission.status !== "success") {
      return dataWithError(null, "Invalid form data.");
    }

    const headers = request.headers;
    const { cloudflare } = context;
    const { user } = requireUser();
    const { intent } = submission.value;
    let message = "";

    switch (intent) {
      case "delete-account":
        if (user.role === "admin") {
          return dataWithError(null, "Admin account cannot be deleted.");
        }

        await Promise.all([
          serverAuth.api.revokeSessions({ headers }),
          serverAuth.api.deleteUser({ body: {}, asResponse: false, headers }),
        ]);
        message = "Account deleted.";
        break;

      case "delete-avatar": {
        if (!user.image) {
          return dataWithError(null, "No avatar to delete.");
        }

        await Promise.all([
          deleteUserImageFromR2(user.image),
          serverAuth.api.updateUser({
            body: { image: null },
            asResponse: false,
            headers,
          }),
        ]);
        message = "Avatar deleted.";
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
          serverAuth.api.updateUser({
            body: { image: imagePath },
            asResponse: true,
            headers,
          }),
        ]);
        message = "Avatar updated.";
        break;
      }

      default:
        return dataWithError(null, "Invalid intent.");
    }

    return dataWithSuccess(null, message);
  } catch (error) {
    console.error("Account action error:", error);
    return dataWithError(null, "An unexpected error occurred.");
  }
}

export default function AccountRoute() {
  const { user } = useAuthUser();
  const { avatarUrl, placeholderUrl } = getAvatarUrl(user.image, user.name);

  return (
    <SettingsLayout title="Account">
      <SettingRow
        title="Avatar"
        description="Click avatar to change profile picture."
        action={
          <AvatarCropper
            avatarUrl={avatarUrl}
            placeholderUrl={placeholderUrl}
          />
        }
      />
      <SettingRow
        title="Name & Email address"
        description={`${user.name}, ${user.email}`}
      />
      <SettingRow
        title="Current sign in"
        description={`You are signed in as ${user.email}`}
        action={<SignOut />}
      />
      <SettingRow
        title="Delete account"
        description="Permanently delete your account."
        action={<DeleteAccount email={user.email} />}
      />
    </SettingsLayout>
  );
}
