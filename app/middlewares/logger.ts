import type { MiddlewareFunction } from "react-router";
import { isProduction } from "~/services/env.server";

enum LogPrefix {
	Outgoing = "-->",
	Incoming = "<--",
	Error = "xxx",
}

const colorStatus = (status: number) => {
	const out: { [key: string]: string } = {
		7: `\x1b[35m${status}\x1b[0m`,
		5: `\x1b[31m${status}\x1b[0m`,
		4: `\x1b[33m${status}\x1b[0m`,
		3: `\x1b[36m${status}\x1b[0m`,
		2: `\x1b[32m${status}\x1b[0m`,
		1: `\x1b[32m${status}\x1b[0m`,
		0: `\x1b[33m${status}\x1b[0m`,
	};
	const calculateStatus = (status / 100) | 0;

	return out[calculateStatus];
};

const humanize = (times: string[]) => {
	const [delimiter, separator] = [",", "."];
	const orderTimes = times.map((v) =>
		v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${delimiter}`),
	);

	return orderTimes.join(separator);
};

const time = (start: number) => {
	const delta = Date.now() - start;

	return humanize([
		delta < 1000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`,
	]);
};

const colorMethod = (method: string) => {
	const upper = method.toUpperCase();
	if (upper === "GET") return `\x1b[32m${upper}\x1b[0m`; // Green
	if (upper === "POST") return `\x1b[36m${upper}\x1b[0m`; // Blue
	if (upper === "PUT") return `\x1b[33m${upper}\x1b[0m`; // Yellow
	if (upper === "DELETE") return `\x1b[31m${upper}\x1b[0m`; // Red
	return `\x1b[35m${upper}\x1b[0m`; // Purple
};

function log(
	prefix: string,
	method: string,
	path: string,
	status = 0,
	elapsed?: string,
) {
	const coloredMethod = colorMethod(method);
	const out =
		prefix === LogPrefix.Incoming
			? `  ${prefix} ${coloredMethod} ${path}`
			: `  ${prefix} ${coloredMethod} ${path} ${colorStatus(status)} ${elapsed}`;

	console.log(out);
}

/**
 * HTTP request logger middleware.
 *
 * In non-production environments, this middleware logs:
 * - request method and path (incoming)
 * - response status and elapsed time (outgoing)
 *
 * Logging is automatically skipped in production environments
 * (based on `context.cloudflare.env.NODE_ENV`).
 *
 * @returns A React Router middleware function.
 */
export const logger: MiddlewareFunction = async ({ request }, next) => {
	if (isProduction) {
		return next();
	}

	const { method } = request;
	const url = new URL(request.url);
	const path = url.pathname + url.search;

	log(LogPrefix.Incoming, method, path);

	const start = Date.now();
	const response = (await next()) as Response;

	log(LogPrefix.Outgoing, method, path, response.status, time(start));

	return response;
};
