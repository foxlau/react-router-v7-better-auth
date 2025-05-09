import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseUserAgent(userAgent: string): {
  system: string;
  browser: string;
  isMobile: boolean;
} {
  const ua = userAgent.toLowerCase();

  let system = "Unknown";
  let isMobile = false;

  if (ua.includes("android")) {
    system = "Android";
    isMobile = true;
  } else if (
    ua.includes("ios") ||
    ua.includes("iphone") ||
    ua.includes("ipad")
  ) {
    system = "iOS";
    isMobile = true;
  } else if (ua.includes("windows")) {
    system = "Windows";
  } else if (ua.includes("mac os") || ua.includes("macos")) {
    system = "Macintosh";
  } else if (ua.includes("linux")) {
    system = "Linux";
  }

  const browserMatchers: {
    regex: RegExp;
    name: (match: RegExpMatchArray) => string;
  }[] = [
    { regex: /firefox\/(\d+(\.\d+)?)/, name: (match) => `Firefox ${match[1]}` },
    { regex: /edg\/(\d+(\.\d+)?)/, name: (match) => `Edge ${match[1]}` },
    { regex: /chrome\/(\d+(\.\d+)?)/, name: (match) => `Chrome ${match[1]}` },
    { regex: /safari\/(\d+(\.\d+)?)/, name: (match) => `Safari ${match[1]}` },
    {
      regex: /(opera|opr)\/(\d+(\.\d+)?)/,
      name: (match) => `Opera ${match[2]}`,
    },
  ];

  let browser = "Unknown";

  for (const matcher of browserMatchers) {
    const match = ua.match(matcher.regex);
    if (
      match &&
      !(matcher.regex.source.includes("safari") && ua.includes("chrome"))
    ) {
      browser = matcher.name(match);
      break;
    }
  }

  return { system, browser, isMobile };
}

export function callAll<Args extends Array<unknown>>(
  ...fns: Array<((...args: Args) => unknown) | undefined>
) {
  return (...args: Args) => {
    for (const fn of fns) {
      fn?.(...args);
    }
  };
}

export function formatDate(
  date: Date | string,
  formatString = "yyyy-MM-dd",
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
}

export function getAvatarUrl(
  userImage: string | null | undefined,
  userName: string | null | undefined,
): string {
  if (userImage) {
    if (userImage.startsWith("http://") || userImage.startsWith("https://")) {
      return userImage;
    }
    return `/images/${userImage}`;
  }
  const seed = userName || "defaultUser";
  return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}&backgroundType=gradientLinear,solid`;
}
