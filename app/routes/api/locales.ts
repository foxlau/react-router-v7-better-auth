import { cacheHeader } from "pretty-cache-header";
import { data } from "react-router";
import { z } from "zod";
import { resources } from "~/lib/i18n";
import type { Route } from "./+types/locales";

export async function loader({ params }: Route.LoaderArgs) {
  const lng = z
    .string()
    .refine((lng): lng is keyof typeof resources =>
      Object.keys(resources).includes(lng),
    )
    .safeParse(params.lng);

  if (lng.error) return data({ error: lng.error }, { status: 400 });

  const namespaces = resources[lng.data];

  const ns = z
    .string()
    .refine((ns): ns is keyof typeof namespaces => {
      return Object.keys(resources[lng.data]).includes(ns);
    })
    .safeParse(params.ns);

  if (ns.error) return data({ error: ns.error }, { status: 400 });

  const headers = new Headers();

  // On production, we want to add cache headers to the response
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Cache-Control",
      cacheHeader({
        maxAge: "5m", // Cache in the browser for 5 minutes
        sMaxage: "1d", // Cache in the CDN for 1 day
        // Serve stale content while revalidating for 7 days
        staleWhileRevalidate: "7d",
        // Serve stale content if there's an error for 7 days
        staleIfError: "7d",
      }),
    );
  }

  return data(namespaces[ns.data], { headers });
}
