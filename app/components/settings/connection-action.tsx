import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import type { AllowedProvider } from "~/lib/config";

export function ConnectionAction({
  provider,
  isConnected,
}: {
  provider: AllowedProvider;
  isConnected: boolean;
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  const intent = isConnected ? "disconnect" : "connect";
  const variant = isConnected ? "secondary" : "outline";
  const label = isConnected ? "Disconnect" : "Connect";

  return (
    <fetcher.Form method="post">
      <input name="intent" value={intent} type="hidden" />
      <input name="provider" value={provider} type="hidden" />
      <Button type="submit" size="sm" variant={variant} disabled={isSubmitting}>
        {label}
      </Button>
    </fetcher.Form>
  );
}
