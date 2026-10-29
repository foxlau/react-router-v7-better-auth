import {
  CircleGaugeIcon,
  LogOutIcon,
  SwatchBookIcon,
  UserCogIcon,
} from 'lucide-react'
import { href, useNavigate, useSubmit } from 'react-router'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useAuthUser } from '~/hooks/use-auth-user'
import { getAvatarUrl } from '~/lib/utils'

import { ThemeSelectorRadioGroup } from '../theme'
import { UserAvatar } from './user-avatar'

export function UserNav() {
  const user = useAuthUser()
  const { avatarUrl } = getAvatarUrl(user.image)
  const navigate = useNavigate()
  const submit = useSubmit()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full">
        <UserAvatar image={avatarUrl} name={user.name} size={32} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar image={avatarUrl} name={user.name} size={32} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-primary">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user.role === 'admin' && (
            <DropdownMenuItem
              onClick={() => {
                navigate(href('/admin'))
              }}
            >
              <CircleGaugeIcon />
              Admin Panel
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              navigate(href('/settings/account'))
            }}
          >
            <UserCogIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SwatchBookIcon className="size-4" />
            Appearance
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ThemeSelectorRadioGroup />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setTimeout(() => {
              submit(null, { method: 'POST', action: href('/auth/sign-out') })
            }, 100)
          }}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
