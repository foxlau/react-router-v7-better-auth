import {
  createRequestHandler,
  unstable_RouterContextProvider,
} from "react-router";
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
    try {
      const contextValue = {
        cloudflare: {
          env,
          ctx,
        },
      };
      const provider = new unstable_RouterContextProvider();
      provider.set(adapterContext, contextValue);
      return requestHandler(request, provider);
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
