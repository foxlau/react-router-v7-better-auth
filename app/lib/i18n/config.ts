import type { InitOptions } from "i18next";
import en from "~/locales/en";
import zh from "~/locales/zh";

export type Resource = typeof en;

export const defaultNS = "translation";
export const fallbackLng = "en"; // fallback language

interface Locale {
  name: string;
  label: string;
  locale: string;
  lang: string;
}

export const locales: Locale[] = [
  { name: "English", label: "English", locale: "en-US", lang: "en" },
  { name: "SimpleChinese", label: "简体中文", locale: "zh-CN", lang: "zh" },
] as const;

export const resources = {
  en: { [defaultNS]: en },
  zh: { [defaultNS]: zh satisfies Resource },
} as const;

export type SupportedLng = keyof typeof resources;

export const supportedLngs = Object.keys(resources);

// export const supportedLngs = Object.keys(resources).map((v) => v as SupportedLng);

export const localesByLang: Record<string, Locale> = locales.reduce(
  (acc, language) => {
    acc[language.lang] = language;
    return acc;
  },
  {} as Record<string, Locale>,
);

export const config = {
  // This is the list of languages your application supports
  supportedLngs,
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng,
  // The default namespace of i18next is "translation", but you can customize it here
  defaultNS,
  // instead of backend
  resources,
} satisfies InitOptions;
