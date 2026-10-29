import { Outlet } from 'react-router'

import { AppHeader } from '~/components/admin/layout/header'
import { AppSidebar } from '~/components/admin/layout/sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { requireAdmin } from '~/middlewares/auth'

import type { Route } from './+types/layout'

export const middleware = [requireAdmin]

// Keep a server check on client navigations; authorization runs before handlers.
export function loader() {
  return null
}

export default function AuthenticatedLayout(_: Route.ComponentProps) {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 64)',
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
  )
}
