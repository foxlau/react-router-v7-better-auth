import { useEffect, useRef } from "react";
import { Form, useNavigation } from "react-router";
import { toast } from "sonner";

import { changePassword } from "~/auth/auth.client";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useIsPending } from "~/hooks/use-is-pending";
import type { Route } from "./+types/change-password";

export const meta = () => [{ title: "Change Password" }];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword.length < 8) {
    return toast.error("New password must be at least 8 characters long.");
  }

  if (newPassword.length > 32) {
    return toast.error("New password must be at most 32 characters long.");
  }

  if (currentPassword === newPassword) {
    return toast.error(
      "New password cannot be the same as the current password.",
    );
  }

  if (newPassword !== confirmPassword) {
    return toast.error("New password and confirm password do not match.");
  }

  const { error } = await changePassword({
    newPassword,
    currentPassword,
    revokeOtherSessions: true,
  });

  if (error) {
    return toast.error(error.message);
  }

  toast.success("Password changed successfully! Other sessions revoked.");
  return null;
}

export default function ChangePassword({ actionData }: Route.ComponentProps) {
  const form = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const isPending = useIsPending({
    formAction: "/change-password",
    formMethod: "POST",
  });

  useEffect(() => {
    if (navigation.state === "idle" && actionData === null) {
      form.current?.reset();
    }
  }, [navigation.state, actionData]);

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-base font-semibold capitalize">Change Password</h1>
        <p className="text-foreground/70">
          New password minimum 8 characters long, maximum 32 characters long,
          and cannot be the same as the current password.
        </p>
      </section>

      <Form ref={form} method="post" className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="confirmPassword"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner /> Changing password...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </Form>

      <hr />

      <section className="space-y-2">
        <h2 className="font-semibold">Note</h2>
        <p className="text-foreground/70">
          If the user signed up using OAuth or another provider, they will not
          have a password or credentials for their account. It is recommended
          that the user go through the "forgot password" flow to set a password
          for their account.{" "}
          <a
            href="https://www.better-auth.com/docs/concepts/users-accounts#set-password"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Learn more
          </a>
        </p>
      </section>
    </div>
  );
}
