import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { describe, expect, test } from 'vitest'

import { NavGroup } from '../app/components/admin/layout/nav-group'
import { navigationGroups } from '../app/components/admin/layout/navigation'
import { ErrorPage } from '../app/components/error-boundary'
import { SidebarProvider } from '../app/components/ui/sidebar'
import { Slider } from '../app/components/ui/slider'
import BetterError from '../app/routes/api/better-error'

function render(element: ReactElement, location = '/') {
  return renderToStaticMarkup(
    createElement(StaticRouter, { location }, element),
  )
}

describe('Base UI navigation', () => {
  test.each([
    ['/admin', '/admin'],
    ['/admin/users', '/admin/users'],
    ['/admin/roles', '/admin/roles'],
    ['/admin/roles/details', '/admin/roles'],
    ['/admin/permissions', '/admin/permissions'],
    ['/administrator', undefined],
  ])(
    '%s highlights only the matching navigation item',
    (location, expected) => {
      const navigation = createElement(
        SidebarProvider,
        {},
        ...navigationGroups.map((group) =>
          createElement(NavGroup, { key: group.id, ...group }),
        ),
      )
      const html = render(navigation, location)
      const active = [...html.matchAll(/<a\b([^>]*)>[\s\S]*?<\/a>/g)].filter(
        (match) => /data-active="(?:true)?"/.test(match[1]),
      )
      expect(active).toHaveLength(expected ? 1 : 0)
      if (expected) expect(active[0]?.[1]).toContain(`href="${expected}"`)
    },
  )

  test('the auth error page renders styled links, not nested buttons', () => {
    const html = render(
      createElement(BetterError),
      '/api/auth/error?error=INVALID_TOKEN',
    )
    const links = html.match(/<a\b[^>]*>/g) ?? []
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link).toContain('data-slot="button"')
      expect(link).toContain('inline-flex')
      expect(link).toContain('border-border')
    }
    expect(html).toContain('href="/auth/sign-in"')
    expect(html).toContain('href="/"')
    expect(html).not.toMatch(/<a\b[^>]*>\s*<button\b/)
  })

  test('the general error page uses the same styled home-link button', () => {
    const html = render(
      createElement(ErrorPage, {
        title: 'Not found',
        description: 'Try another page.',
      }),
    )
    expect(html).toMatch(/<a\b[^>]*data-slot="button"/)
    expect(html).toContain('Go to Home')
    expect(html).not.toMatch(/<a\b[^>]*>\s*<button\b/)
  })

  test('the zoom slider exposes its orientation, track and current value', () => {
    const html = renderToStaticMarkup(
      createElement(Slider, {
        value: [1.5],
        min: 1,
        max: 3,
        'aria-label': 'Zoom slider',
      }),
    )
    expect(html).toContain('data-slot="slider-track"')
    expect(html).toContain('data-orientation="horizontal"')
    expect(html).toContain('aria-valuenow="1.5"')
    expect(html).toMatch(/<input\b[^>]*aria-label="Zoom slider"/)
  })
})
