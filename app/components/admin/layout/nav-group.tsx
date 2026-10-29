import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, matchPath, useLocation } from 'react-router'

import { Badge } from '~/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '~/components/ui/sidebar'

import type {
  NavItemCollapsible,
  NavItemLink,
  NavItemUnion,
} from './navigation'

function isNavLink(item: NavItemUnion): item is NavItemLink {
  return !item.items
}

function isActiveLink(currentPath: string, targetUrl?: string): boolean {
  return Boolean(
    targetUrl &&
    matchPath({ path: targetUrl, end: targetUrl === '/admin' }, currentPath),
  )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
)

const SidebarMenuLink = ({
  item,
  href,
}: {
  item: NavItemLink
  href: string
}) => {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link to={item.url} onClick={() => setOpenMobile(false)} />}
        isActive={isActiveLink(href, item.url)}
        tooltip={item.title}
      >
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        {item.badge && <NavBadge>{item.badge}</NavBadge>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavItemCollapsible
  href: string
}) => {
  const { setOpenMobile } = useSidebar()
  const isGroupActive = Boolean(
    (item.url && isActiveLink(href, item.url)) ||
    item.items.some((subItem) => isActiveLink(href, subItem.url)),
  )
  return (
    <Collapsible
      render={<SidebarMenuItem />}
      defaultOpen={isGroupActive}
      className="group/collapsible"
    >
      <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        {item.badge && <NavBadge>{item.badge}</NavBadge>}
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                render={
                  <Link to={subItem.url} onClick={() => setOpenMobile(false)} />
                }
                isActive={isActiveLink(href, subItem.url)}
              >
                {subItem.icon && <subItem.icon />}
                <span>{subItem.title}</span>
                {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavItemCollapsible
  href: string
}) => {
  const isGroupActive = Boolean(
    (item.url && isActiveLink(href, item.url)) ||
    item.items.some((subItem) => isActiveLink(href, subItem.url)),
  )
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton tooltip={item.title} isActive={isGroupActive} />
          }
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
          <ChevronRight className="ml-auto" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              {item.title} {item.badge ? `(${item.badge})` : ''}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.items.map((sub) => (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                render={<Link to={sub.url} />}
                className={isActiveLink(href, sub.url) ? 'bg-secondary' : ''}
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && (
                  <span className="ml-auto text-xs">{sub.badge}</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function NavGroup({
  title,
  items,
}: {
  title?: string
  items: NavItemUnion[]
}) {
  const { state } = useSidebar()
  const { pathname: href } = useLocation()
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url ?? ''}`
          if (isNavLink(item))
            return <SidebarMenuLink key={key} item={item} href={href} />
          if (state === 'collapsed')
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
            )
          return <SidebarMenuCollapsible key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
