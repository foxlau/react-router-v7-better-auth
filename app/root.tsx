import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  isRouteErrorResponse,
} from "react-router";
import { Toaster } from "sonner";

import { ProgressBar } from "./components/progress-bar";
import {
  ThemeSwitcherSafeHTML,
  ThemeSwitcherScript,
} from "./components/theme-switcher";
import { useNonce } from "./hooks/use-nonce";
import "./styles/app.css";
import type { Route } from "./+types/root";
import { getPublicEnv } from "./lib/env.server";

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

export async function loader(_: Route.LoaderArgs) {
  return data({ ENV: getPublicEnv() });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();

  return (
    <ThemeSwitcherSafeHTML
      lang="en"
      className="touch-manipulation overflow-x-hidden"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ThemeSwitcherScript nonce={nonce} />
      </head>
      <body>
        <ProgressBar />
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster position="top-center" />
      </body>
    </ThemeSwitcherSafeHTML>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { ENV } = loaderData;
  const nonce = useNonce();

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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto space-y-4 p-4 pt-16">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">{message}</h1>
        <p>{details}</p>
      </div>
      {stack && (
        <pre className="w-full overflow-x-auto rounded-lg bg-destructive/5 p-4 text-destructive text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
