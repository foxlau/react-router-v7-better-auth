import { redirect } from "react-router";

async function ensureSecure(request: Request) {
  const proto = request.headers.get("x-forwarded-proto");
  // this indirectly allows `http://localhost` because there is no
  // "x-forwarded-proto" in the local server headers
  if (proto === "http") {
    const secureUrl = new URL(request.url);
    secureUrl.protocol = "https:";
    throw redirect(secureUrl.toString());
  }
}

async function removeTrailingSlashes(request: Request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    url.pathname = url.pathname.slice(0, -1);
    throw redirect(url.toString());
  }
}

export async function requestMiddleware(request: Request) {
  await ensureSecure(request);
  await removeTrailingSlashes(request);
}
