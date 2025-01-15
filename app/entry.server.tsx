import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type {
  AppLoadContext,
  EntryContext,
  HandleErrorFunction,
} from "react-router";
import { ServerRouter } from "react-router";
import { NonceProvider } from "./hooks/use-nonce";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
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
      <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
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
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
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
