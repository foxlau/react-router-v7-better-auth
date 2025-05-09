import { XIcon } from "lucide-react";
import { BetterAuthIcon, ReactRouterIcon } from "~/components/icons";

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <ReactRouterIcon theme="light" className="block w-7 dark:hidden" />
      <ReactRouterIcon theme="dark" className="hidden w-7 dark:block" />
      <XIcon className="size-3 text-muted-foreground" />
      <BetterAuthIcon className="size-6" />
    </div>
  );
}
