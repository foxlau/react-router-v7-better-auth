/**
 * Color scheme implementation based on React Router's official website solution
 * @see https://github.com/remix-run/react-router-website
 *
 * This component provides a complete color theme switching solution:
 * - Supports system/light/dark modes
 * - Includes client and server-side isomorphic rendering
 * - Uses Zod for type validation
 * - Responds to system theme changes
 */

import { useLayoutEffect, useMemo } from "react";
import {
  useLocation,
  useNavigation,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import { z } from "zod";
import type { loader as rootLoader } from "~/root";

export const ColorSchemeSchema = z.object({
  colorScheme: z.enum(["light", "dark", "system"]),
  returnTo: z.string().optional(),
});

export type ColorScheme = z.infer<typeof ColorSchemeSchema>["colorScheme"];

/**
 * This hook is used to get the color scheme from the fetcher or the root loader
 * @returns The color scheme
 */
export function useColorScheme(): ColorScheme {
  const rootLoaderData = useRouteLoaderData<typeof rootLoader>("root");
  const rootColorScheme = rootLoaderData?.colorScheme ?? "system";

  const { formData } = useNavigation();
  const optimisticColorScheme = formData?.has("colorScheme")
    ? (formData.get("colorScheme") as ColorScheme)
    : null;
  return optimisticColorScheme || rootColorScheme;
}

/**
 * This hook is used to set the color scheme on the document element
 * @returns The submit function
 */
export function useSetColorScheme() {
  const location = useLocation();
  const submit = useSubmit();

  return (colorScheme: ColorScheme) => {
    submit(
      {
        colorScheme,
        returnTo: location.pathname + location.search,
      },
      {
        method: "post",
        action: "/api/color-scheme",
        preventScrollReset: true,
        replace: true,
      },
    );
  };
}

/**
 * This component is used to set the color scheme on the document element
 * @param nonce The nonce to use for the script
 * @returns The script element
 */
export function ColorSchemeScript({ nonce }: { nonce: string }) {
  const colorScheme = useColorScheme();

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  const script = useMemo(
    () =>
      `let colorScheme = ${JSON.stringify(colorScheme)}; if (colorScheme === "system") { let media = window.matchMedia("(prefers-color-scheme: dark)"); if (media.matches) document.documentElement.classList.add("dark"); }`,
    [],
    // we don't want this script to ever change
  );

  if (typeof document !== "undefined") {
    // biome-ignore lint/correctness/useHookAtTopLevel: false positive
    useLayoutEffect(() => {
      if (colorScheme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (colorScheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (colorScheme === "system") {
        function check(media: MediaQueryList | MediaQueryListEvent) {
          if (media.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        check(media);

        media.addEventListener("change", check);
        return () => media.removeEventListener("change", check);
      } else {
        console.error("Impossible color scheme state:", colorScheme);
      }
    }, [colorScheme]);
  }

  return (
    <>
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content={colorScheme === "dark" ? "#09090b" : "#ffffff"}
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content={colorScheme === "light" ? "#ffffff" : "#09090b"}
      />
      <script
        nonce={nonce}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: false positive
        dangerouslySetInnerHTML={{
          __html: script,
        }}
      />
    </>
  );
}
