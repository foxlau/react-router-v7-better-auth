import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { authClient } from "~/lib/auth/auth.client";
import type { AllowedProvider } from "~/lib/config";
import { LoadingButton } from "../forms";

export function ConnectionAction({
  provider,
  isConnected,
}: {
  provider: AllowedProvider;
  isConnected: boolean;
}) {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const variant = isConnected ? "secondary" : "outline";
  const label = isConnected ? "Disconnect" : "Connect";

  const handleLinkSocial = async () => {
    setIsConnecting(true);
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: "/settings/connections",
    });
    if (error) {
      toast.error(error.message || "Failed to connect.");
    }
    setIsConnecting(false);
  };

  const handleUnlinkSocial = async () => {
    setIsConnecting(true);
    const { error } = await authClient.unlinkAccount({
      providerId: provider,
    });
    if (error) {
      toast.error(error.message || "Failed to disconnect.");
    }
    setIsConnecting(false);
    navigate(".");
  };

  return (
    <LoadingButton
      size="sm"
      variant={variant}
      buttonText={label}
      loadingText={isConnecting ? "Connecting..." : "Disconnecting..."}
      isPending={isConnecting}
      onClick={isConnected ? handleUnlinkSocial : handleLinkSocial}
    />
  );
}
