import { isAPIError } from 'better-auth/api'
import { href, redirect } from 'react-router'
import { toast } from 'sonner'

import { SignOutOfOtherSessions } from '~/components/settings/session-action'
import { SessionItem } from '~/components/settings/session-item'
import { SettingsLayout } from '~/components/settings/settings-layout'
import { getPageTitle } from '~/lib/utils'
import { requiredAuthContext } from '~/middlewares/auth'
import { authClient } from '~/services/auth/auth.client'
import { auth } from '~/services/auth/auth.server'

import type { Route } from './+types/sessions'

export function meta() {
  return [{ title: getPageTitle('Sessions') }]
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { session } = context.get(requiredAuthContext)
  try {
    const listSessions = await auth.api.listSessions({
      headers: request.headers,
    })
    return { listSessions, session }
  } catch (error) {
    if (
      isAPIError(error) &&
      (error.body?.code === 'SESSION_NOT_FRESH' ||
        error.body?.code === 'UNAUTHORIZED')
    ) {
      const search = new URLSearchParams({
        reauth: 'true',
        redirectTo: href('/settings/sessions'),
      })
      throw redirect(`${href('/auth/sign-in')}?${search}`)
    }
    throw error
  }
}

export async function clientAction(_: Route.ClientActionArgs) {
  const { error } = await authClient.revokeOtherSessions()
  if (error) {
    toast.error(error.message || 'An unexpected error occurred.')
    return { status: 'error' }
  }
  toast.success('Other sessions signed out successfully.')
  return { status: 'success' }
}

export default function SessionsRoute({
  loaderData: { listSessions, session },
}: Route.ComponentProps) {
  return (
    <SettingsLayout
      title="Sessions"
      description="If necessary, you can sign out of all other browser sessions. Some of your recent sessions are listed below, but this list may not be complete. If you think your account has been compromised, you should also update your password."
    >
      <div className="space-y-4 py-4">
        <div className="divide-y rounded-lg border shadow-xs">
          {listSessions.length === 0 ? (
            <div className="px-4 py-3">No sessions found.</div>
          ) : (
            listSessions.map((item) => (
              <SessionItem
                key={item.token}
                session={item}
                currentSessionToken={session.token}
              />
            ))
          )}
        </div>
        {listSessions.length > 1 && <SignOutOfOtherSessions />}
      </div>
    </SettingsLayout>
  )
}
