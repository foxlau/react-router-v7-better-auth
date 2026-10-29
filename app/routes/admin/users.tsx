import { asc, desc } from 'drizzle-orm'
import { href, type MiddlewareFunction } from 'react-router'

import { DateTimeDisplay } from '~/components/datetime-display'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { UserAvatar } from '~/components/user/user-avatar'
import { db } from '~/db/index.server'
import { users } from '~/db/schema'
import { getAvatarUrl, getPageTitle } from '~/lib/utils'
import { requiredAuthContext } from '~/middlewares/auth'
import { requirePermission } from '~/services/auth/permissions.server'

import type { Route } from './+types/users'

export const middleware: MiddlewareFunction[] = [
  async ({ context }) => {
    const { user } = context.get(requiredAuthContext)
    await requirePermission(user.id, { user: ['list'] })
  },
]

export function meta() {
  return [{ title: getPageTitle('Users') }]
}

export const handle = {
  breadcrumb: () => ({ label: 'Users', to: href('/admin/users') }),
}

export async function loader(_: Route.LoaderArgs) {
  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      username: users.username,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      banned: users.banned,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt), asc(users.id))

  return { users: userList }
}

export default function UsersRoute({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          View registered users and their account details.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table aria-label="Users">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-12">
                <span className="sr-only">Avatar</span>
              </TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Username</TableHead>
              <TableHead scope="col">Role</TableHead>
              <TableHead scope="col">Verification</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loaderData.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              loaderData.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <UserAvatar
                      image={getAvatarUrl(user.image).avatarUrl}
                      name={user.name}
                      size={32}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>{user.username || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role || 'user'}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.banned ? 'destructive' : 'outline'}>
                      {user.banned ? 'Banned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DateTimeDisplay date={user.createdAt} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
