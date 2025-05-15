import { initReactI18next } from "react-i18next";

import { config, unstable_createI18nextMiddleware } from "~/lib/i18n";

export const [i18nextMiddleware, getLocale, getInstance] =
  unstable_createI18nextMiddleware({
    options: config,
    plugins: [initReactI18next],
  });
