import { CircleFadingPlusIcon, UserIcon } from 'lucide-react'
import { href, Link, Outlet } from 'react-router'

import { AppLogo } from '~/components/app-logo'
import { Button } from '~/components/ui/button'
import { UserNav } from '~/components/user/user-nav'
import { useOptionalAuthUser } from '~/hooks/use-auth-user'

export default function AuthenticatedLayout() {
  const user = useOptionalAuthUser()

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="flex w-full items-center justify-between p-4 sm:px-10">
          <Link to={href('/')} className="flex items-center gap-2">
            <AppLogo />
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  render={<Link to="/todos" />}
                  nativeButton={false}
                  aria-label="Create todo"
                >
                  <CircleFadingPlusIcon />
                </Button>
                <UserNav />
              </>
            ) : (
              <Button
                variant="outline"
                render={<Link to={href('/auth/sign-in')} />}
                nativeButton={false}
              >
                <UserIcon className="size-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4 sm:p-10">
        <Outlet />
      </main>
    </>
  )
}
