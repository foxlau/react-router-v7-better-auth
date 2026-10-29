import { Outlet } from 'react-router'

import { Menu } from '~/components/settings/settings-menu'
import { requireAuthMiddleware } from '~/middlewares/auth'

import type { Route } from './+types/layout'

export const middleware = [requireAuthMiddleware]

// Force a server request so the guard also runs on client-side navigations.
export function loader() {
  return null
}

export default function Layout(_: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Settings</h2>
        <Menu />
      </div>
      <Outlet />
    </>
  )
}
