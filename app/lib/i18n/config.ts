import type { InitOptions } from "i18next";
import en from "./locales/en";
import zh from "./locales/zh";

export const fallbackLng = "en";
export const supportedLngs = ["en", "zh"] as const;
export const defaultNS = "translation";

export type SupportedLng = (typeof supportedLngs)[number];

// export type Resources = { [K in SupportedLng]: typeof en };
export type Resources = Record<SupportedLng, typeof en>;
export const resources = {
  en,
  zh,
} satisfies Resources;

// export const supportedList = Object.keys(resources).map((v) => v);
export const supportedList = supportedLngs.map((v) => v.toString());

export interface Locale {
  name: string;
  label: string;
  locale: string;
  lang: SupportedLng;
}

export const locales: Array<Locale> = [
  { name: "English", label: "English", locale: "en-US", lang: "en" },
  { name: "SimpleChinese", label: "简体中文", locale: "zh-CN", lang: "zh" },
] as const;

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

// zod-i18n
// https://github.com/aiji42/zod-i18n/blob/main/packages/core/locales/en/zod.json
// export type ZodResources = Record<SupportedLng, Pick<typeof en, "zod">>;
// export const zodResources = {
//   en: { zod: en.zod },
//   zh: { zod: zh.zod },
// } satisfies ZodResources;
