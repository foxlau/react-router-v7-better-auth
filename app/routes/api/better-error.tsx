import { ArrowLeftIcon, ShieldAlert } from 'lucide-react'
import {
  href,
  Link,
  type LoaderFunctionArgs,
  useSearchParams,
} from 'react-router'

import { Button } from '~/components/ui/button'
import { getPageTitle } from '~/lib/utils'
import { auth } from '~/services/auth/auth.server'

export function meta() {
  return [{ title: getPageTitle('Authentication Error') }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request)
}

export default function BetterError() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  return (
    <div className="container mx-auto flex min-h-screen items-center px-6 py-12">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <p className="rounded-full bg-muted p-3 font-medium">
          <ShieldAlert className="h-6 w-6" />
        </p>

        <h1 className="mt-2 text-xl font-semibold md:text-2xl">
          Authentication Error
        </h1>

        <p className="mt-2 text-muted-foreground">
          {error_description
            ? error_description
            : 'We encountered an issue while processing your request. Please try\
						again or contact the application owner if the problem persists.'}
        </p>

        <div className="mt-6 flex w-full shrink-0 items-center justify-center space-x-3">
          <Button
            variant="outline"
            render={<Link to={href('/auth/sign-in')} />}
            nativeButton={false}
          >
            <ArrowLeftIcon className="size-4" />
            Go to Login
          </Button>
          <Button
            variant="outline"
            render={<Link to={href('/')} />}
            nativeButton={false}
          >
            Take me home
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground underline decoration-muted-foreground/30 decoration-wavy decoration-1 underline-offset-2">
          Error code: {error}
        </p>
      </div>
    </div>
  )
}
