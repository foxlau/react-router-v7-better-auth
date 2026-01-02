import crypto from "node:crypto";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext, HandleErrorFunction } from "react-router";
import { isRouteErrorResponse, ServerRouter } from "react-router";
import { NonceProvider } from "./hooks/use-nonce";
import { buildContentSecurityPolicy } from "./lib/csp";
import { isDevelopment } from "./services/env.server";

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
) {
	let shellRendered = false;
	const userAgent = request.headers.get("user-agent");
	const nonce = crypto.randomBytes(16).toString("hex");
	const contentSecurityPolicy = buildContentSecurityPolicy({
		baseUri: ["'self'"],
		objectSrc: ["'none'"],
		connectSrc: ["'self'", isDevelopment ? "ws:" : ""],
		scriptSrc: ["'self'", `'nonce-${nonce}'`],
		workerSrc: ["'self'", isDevelopment ? "blob:" : ""],
		scriptSrcAttr: [`'nonce-${nonce}'`],
		imgSrc: ["'self'", "data:", "blob:", "https:"],
		fontSrc: ["'self'", "https://fonts.gstatic.com"],
		frameSrc: ["'self'"],
		formAction: ["'self'"],
	});

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
	responseHeaders.set("Content-Security-Policy", contentSecurityPolicy);

	return new Response(body, {
		headers: responseHeaders,
		status: responseStatusCode,
	});
}

// Error Reporting
// https://reactrouter.com/how-to/error-reporting
export const handleError: HandleErrorFunction = (error, { request }) => {
	// Don't log aborted requests - they're expected
	if (request.signal.aborted) {
		return;
	}

	// Don't log 404's - they're usually just bot noise
	if (isRouteErrorResponse(error) && error.status === 404) {
		return;
	}

	if (error instanceof Error) {
		console.error(error.stack);
	} else {
		console.error(error);
	}
};
