import { data, href, Outlet, redirect } from "react-router";
import { AppHeader } from "~/components/admin/layout/header";
import { AppSidebar } from "~/components/admin/layout/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { requireAuth, requireUser } from "~/middlewares/auth-guard";
import type { Route } from "./+types/layout";

export const middleware = [requireAuth];

export async function loader(_: Route.LoaderArgs) {
  const user = requireUser();
  if (user.user.role !== "admin") throw redirect(href("/home"));
  return data(user);
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
