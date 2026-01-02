/**
 * Content Security Policy utilities for building CSP header strings.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
 */

type DirectiveValue = ReadonlyArray<string> | string | boolean;

interface ContentSecurityPolicyDirectives {
	// Fetch directives
	defaultSrc?: DirectiveValue;
	childSrc?: DirectiveValue;
	connectSrc?: DirectiveValue;
	fontSrc?: DirectiveValue;
	frameSrc?: DirectiveValue;
	imgSrc?: DirectiveValue;
	manifestSrc?: DirectiveValue;
	mediaSrc?: DirectiveValue;
	objectSrc?: DirectiveValue;
	prefetchSrc?: DirectiveValue;
	scriptSrc?: DirectiveValue;
	scriptSrcElem?: DirectiveValue;
	scriptSrcAttr?: DirectiveValue;
	styleSrc?: DirectiveValue;
	styleSrcElem?: DirectiveValue;
	styleSrcAttr?: DirectiveValue;
	workerSrc?: DirectiveValue;
	fencedFrameSrc?: DirectiveValue;

	// Document directives
	baseUri?: DirectiveValue;
	sandbox?: DirectiveValue;

	// Navigation directives
	formAction?: DirectiveValue;
	frameAncestors?: DirectiveValue;

	// Reporting directives
	reportTo?: DirectiveValue;
	reportUri?: DirectiveValue;

	// Other directives
	requireTrustedTypesFor?: DirectiveValue;
	trustedTypes?: DirectiveValue;
	upgradeInsecureRequests?: DirectiveValue;

	// Deprecated directives
	blockAllMixedContent?: DirectiveValue;
}

/**
 * Builds a Content Security Policy string from directive options.
 *
 * @example
 * ```ts
 * buildContentSecurityPolicy({
 *   defaultSrc: ["'self'"],
 *   scriptSrc: ["'self'", "https://example.com"],
 *   upgradeInsecureRequests: true,
 * });
 * ```
 */
export function buildContentSecurityPolicy(
	directives: Readonly<
		| ContentSecurityPolicyDirectives
		| Map<string, DirectiveValue>
		| Record<string, DirectiveValue>
	>,
): string {
	const result: string[] = [];
	const entries: Iterable<[string, DirectiveValue]> =
		directives instanceof Map
			? directives.entries()
			: Object.entries(directives);
	const namesSeen = new Set<string>();

	for (const [rawName, rawValue] of entries) {
		const name = rawName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

		if (namesSeen.has(name)) {
			throw new Error(`Directive "${rawName}" is specified more than once`);
		}
		namesSeen.add(name);

		if (rawValue === true) {
			result.push(name);
			continue;
		}
		if (rawValue === false || rawValue == null) {
			continue;
		}

		let value: string;
		if (typeof rawValue === "string") {
			value = rawValue;
		} else {
			const filtered = rawValue.filter((v) => v != null && v !== "");
			if (filtered.length === 0) {
				continue;
			}
			value = filtered.join(" ");
		}

		if (/[;\r\n]/.test(value)) {
			throw new Error(
				`Directive "${rawName}" contains invalid characters (semicolon or newline)`,
			);
		}

		result.push(value ? `${name} ${value}` : name);
	}

	return result.join("; ");
}
