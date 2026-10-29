import { ArrowLeftIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Button variant="ghost" size="sm" className="fixed top-4 left-4" asChild>
        <Link to="/">
          <ArrowLeftIcon className="size-4" /> Home
        </Link>
      </Button>
      <div className="mx-auto w-75 sm:w-90">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-balance text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
