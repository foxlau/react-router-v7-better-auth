import { createCookie, createCookieSessionStorage } from "react-router";
import { fallbackLng, supportedList } from "./config";

const methods = ["cookie", "session", "path"] as const;

export type Method = (typeof methods)[number];

export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  secrets: [process.env.BETTER_AUTH_SECRET],
  // secrets: ["secrets"],
  httpOnly: true,
});

export const localeSession = createCookieSessionStorage({
  cookie: {
    name: "session",
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.BETTER_AUTH_SECRET],
    // secrets: ["secrets"],
    httpOnly: true,
  },
});

export async function detect(
  request: Request,
  method: Method,
): Promise<string> {
  if (method === "cookie") {
    return await fromCookie(request);
  }
  if (method === "session") {
    return await fromSession(request);
  }
  if (method === "path") {
    return fromPath(request);
  }
  return fallbackLng;
}

async function fromCookie(request: Request): Promise<string> {
  // if (!localeCookie) return fallbackLng;
  const lng = await localeCookie.parse(request.headers.get("Cookie"));
  // console.log("fromCookie lng =>", lng);
  return lng || fallbackLng;
}

async function fromSession(request: Request): Promise<string> {
  // if (!localeSession) return fallbackLng;
  const session = await localeSession.getSession(request.headers.get("Cookie"));
  const lng = session.get("lng");
  // console.log("fromSession lng =>", lng);
  return lng || fallbackLng;
}

function fromPath(request: Request) {
  const { pathname } = new URL(request.url);
  return findLocaleByPath(pathname);
}

export function findLocaleByPath(pathname: string) {
  const segments = pathname.split("/");
  const lang = segments.at(1);
  if (lang && supportedList.includes(lang)) {
    return lang;
  }
  return fallbackLng;
}
