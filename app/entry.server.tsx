import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import type {
  AppLoadContext,
  EntryContext,
  HandleErrorFunction,
  unstable_RouterContextProvider,
} from "react-router";
import { ServerRouter } from "react-router";
import { NonceProvider } from "./hooks/use-nonce";
import { getInstance } from "./middlewares/i18next";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  routerContext: unstable_RouterContextProvider,
  _loadContext: AppLoadContext,
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");

  // Set a random nonce for CSP.
  const nonce = crypto.randomUUID() ?? undefined;

  // Set CSP headers to prevent 'Prop nonce did not match' error
  // Without this, browser security policy will clear the nonce attribute on the client side
  responseHeaders.set(
    "Content-Security-Policy",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`,
  );

  const body = await renderToReadableStream(
    <NonceProvider value={nonce}>
      <I18nextProvider i18n={getInstance(routerContext)}>
        <ServerRouter context={entryContext} url={request.url} nonce={nonce} />
      </I18nextProvider>
    </NonceProvider>,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          console.error(error);
        }
      },
      signal: request.signal,
      nonce,
    },
  );
  shellRendered = true;

  // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
  // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
  if ((userAgent && isbot(userAgent)) || entryContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

// Error Reporting
// https://reactrouter.com/how-to/error-reporting
export const handleError: HandleErrorFunction = (error, { request }) => {
  if (request.signal.aborted) {
    return;
  }

  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(error);
  }
};
