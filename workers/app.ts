import { createRequestHandler } from "react-router";
import { adapterContext } from "~/lib/contexts";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
  export interface Future {
    unstable_viteEnvironmentApi: true;
    unstable_middleware: true;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const contextValue = {
      cloudflare: {
        env,
        ctx,
      },
    };
    const context = new Map([[adapterContext, contextValue]]);
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
