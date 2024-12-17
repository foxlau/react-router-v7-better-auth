import { ContactRoundIcon } from "lucide-react";
import { useEffect } from "react";
import { Form } from "react-router";

import { useDoubleCheck } from "~/hooks/use-double-check";
import { useIsPending } from "~/hooks/use-is-pending";
import type { loader } from "~/routes/dashboard";
import { GithubIcon, GoogleIcon } from "./icons";
import { Spinner } from "./spinner";
import { Button } from "./ui/button";

export function ConnectedAccountItem({
  account,
  email,
}: {
  account: Awaited<ReturnType<typeof loader>>["accounts"][number];
  email: string;
}) {
  let iconComponent: React.ReactNode;

  switch (account.provider) {
    case "google":
      iconComponent = <GoogleIcon className="size-4 flex-none" />;
      break;
    case "github":
      iconComponent = <GithubIcon className="size-4 flex-none" />;
      break;
    default:
      iconComponent = <ContactRoundIcon className="size-4 flex-none" />;
      break;
  }

  return (
    <div className="flex flex-row items-center space-x-2 text-sm">
      {iconComponent}
      <span className="capitalize">{account.provider}</span>
      <small className="mx-1 text-muted-foreground">•</small>
      <span>{email}</span>
    </div>
  );
}

export function DeleteAccount() {
  const { doubleCheck, setDoubleCheck, getButtonProps } = useDoubleCheck();

  const isPending = useIsPending({
    formAction: "/dashboard",
    formMethod: "POST",
  });

  useEffect(() => {
    if (isPending) {
      setDoubleCheck(false);
    }
  }, [isPending, setDoubleCheck]);

  return (
    <Form method="POST" action="/dashboard" className="space-y-4">
      <h2 className="font-semibold">Delete account</h2>
      <p className="text-foreground/70">
        Once you delete your account, you will not be able to sign in again. You
        will also lose access to your account and any data associated with it.
      </p>
      <Button
        type="submit"
        name="intent"
        value="deleteUser"
        size="sm"
        variant="destructive"
        disabled={isPending}
        {...getButtonProps()}
      >
        {isPending && <Spinner />}
        {doubleCheck ? "Are you sure?" : "Delete Account"}
      </Button>
    </Form>
  );
}
