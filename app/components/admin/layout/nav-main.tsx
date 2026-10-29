import { useAuthUser } from '~/hooks/use-auth-user'

import { NavGroup } from './nav-group'
import { navigationGroups } from './navigation'

export function NavMain() {
  const user = useAuthUser()
  const isAdmin = user.role?.split(',').includes('admin')

  return (
    <>
      {navigationGroups.map((props) => (
        <NavGroup
          key={props.id}
          {...props}
          items={props.items.filter((item) => !item.adminOnly || isAdmin)}
        />
      ))}
    </>
  )
}
