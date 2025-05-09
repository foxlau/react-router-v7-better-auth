import { adapterContext } from "~/lib/contexts";
import type { Route } from "./+types/images";

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const key = params["*"];
  const _context = context.get(adapterContext);
  const object = await _context.cloudflare.env.R2.get(key);
  if (!object) {
    return new Response(null, { status: 404 });
  }

  const blob = await object.blob();
  return new Response(blob.stream(), {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octed-stream",
    },
  });
};
