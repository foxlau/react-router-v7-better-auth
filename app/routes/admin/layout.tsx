import { data, Outlet } from "react-router";
import { AppHeader } from "~/components/admin/layout/header";
import { AppSidebar } from "~/components/admin/layout/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { authSessionContext } from "~/lib/contexts";
import { authMiddleware } from "~/middlewares/auth-guard.server";
import type { Route } from "./+types/layout";

export const unstable_middleware = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(authSessionContext);
  return data(authSession);
}

export default function AuthenticatedLayout(_: Route.ComponentProps) {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col space-y-4 p-4 sm:px-8 sm:py-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
