import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
} from "react-router";
import { getToast } from "remix-toast";
import { Toaster, toast as notify } from "sonner";
import { ProgressBar } from "./components/progress-bar";
import { useNonce } from "./hooks/use-nonce";
import "./styles/app.css";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/root";
import { GeneralErrorBoundary } from "./components/error-boundary";
import {
  ColorSchemeScript,
  useColorScheme,
} from "./lib/color-scheme/components";
import { parseColorScheme } from "./lib/color-scheme/server";
import { getPublicEnv } from "./lib/env.server";
import { requestMiddleware } from "./lib/http.server";
import { getLocale, i18nextMiddleware } from "./middlewares/i18next";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap",
  },
];

export const unstable_middleware = [i18nextMiddleware];

export async function loader({ request, context }: Route.LoaderArgs) {
  await requestMiddleware(request);
  const colorScheme = await parseColorScheme(request);
  const { toast, headers } = await getToast(request);
  // get locale and set
  const locale = getLocale(context);
  // use session
  // const session = await localeSession.getSession(request.headers.get("Cookie"));
  // session.set("lng", locale);
  // headers.append("Set-Cookie", await localeSession.commitSession(session));
  // use cookie
  // headers.append("Set-Cookie", await localeCookie.serialize(locale));
  return data({ locale, ENV: getPublicEnv(), colorScheme, toast }, { headers });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();
  const colorScheme = useColorScheme();
  const { i18n } = useTranslation();

  return (
    <html
      lang={i18n.language}
      dir={i18n.dir(i18n.language)}
      className={`${colorScheme === "dark" ? "dark" : ""} touch-manipulation overflow-x-hidden`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <Meta />
        <Links />
        <ColorSchemeScript nonce={nonce} />
      </head>
      <body>
        <ProgressBar />
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster position="top-center" theme={colorScheme} />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { ENV, toast, locale } = loaderData;
  const nonce = useNonce();
  const { i18n } = useTranslation();
  // console.log(`App => locale = ${locale}, i18n.language = ${i18n.language}`);

  useEffect(() => {
    if (i18n.language !== locale) i18n.changeLanguage(locale);
  }, [locale, i18n]);

  useEffect(() => {
    if (toast?.type === "error") {
      notify.error(toast.message);
    }
    if (toast?.type === "success") {
      notify.success(toast.message);
    }
  }, [toast]);

  return (
    <>
      <Outlet />
      <script
        nonce={nonce}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)}`,
        }}
      />
    </>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
