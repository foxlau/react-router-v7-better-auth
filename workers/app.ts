import { createRequestHandler, RouterContextProvider } from "react-router";

declare module "react-router" {
	export interface RouterContextProvider {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		const context = new RouterContextProvider();
		return await requestHandler(
			request,
			Object.assign(context, {
				cloudflare: { env, ctx },
			}),
		);
	},
} satisfies ExportedHandler<Env>;
