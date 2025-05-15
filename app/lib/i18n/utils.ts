import { fallbackLng, supportedLngs } from "./config";

export function getLocalePath(pathname: string, lang: string) {
  const segments = pathname.split("/");
  // static files
  if (segments.at(-1)?.includes(".")) {
    return pathname;
  }

  // transition to default language
  if (lang === fallbackLng) {
    if (segments[1] && supportedLngs.includes(segments[1])) {
      // /en/auth/sign-in => /auth/sign-in
      segments.splice(1, 1);
      return segments.join("/") || "/";
    }
    return pathname;
  }

  if (segments[1] && supportedLngs.includes(segments[1])) {
    // if path includes language, replace it
    segments[1] = lang;
  } else {
    // add language in path, /auth/sign-in => /zh/auth/sign-in
    segments.splice(1, 0, lang);
  }
  return segments.join("/");
}

export function filterLocale(lang: string) {
  if (lang === fallbackLng) {
    return {};
  }
  if (supportedLngs.includes(lang)) {
    return { lang };
  }
  return {};
}
