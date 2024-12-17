import { createRequestHandler, type ServerBuild } from "react-router";
import { runSession } from "session-context";

import { getLoadContext } from "./load-context";
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "../build/server";

const requestHandler = createRequestHandler(build as unknown as ServerBuild);

export default {
  async fetch(request, env, ctx) {
    return runSession(async () => {
      try {
        const loadContext = getLoadContext({
          request,
          context: {
            cloudflare: {
              ctx: {
                waitUntil: ctx.waitUntil.bind(ctx),
                passThroughOnException: ctx.passThroughOnException.bind(ctx),
              },
              cf: request.cf as never,
              caches,
              env,
            },
          },
        });
        return await requestHandler(request, loadContext);
      } catch (error) {
        console.log(error);
        return new Response("An unexpected error occurred", { status: 500 });
      }
    });
  },
} satisfies ExportedHandler<Env>;
