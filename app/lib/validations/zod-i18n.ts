import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";

z.setErrorMap(zodI18nMap);

// const setZodLanguage = (language: SupportedLng) => {
//   i18next.changeLanguage(language);
//   z.setErrorMap(makeZodI18nMap({ t: i18next.t }));
// };

function zodT(key: string, options?: Record<string, string>) {
  return i18next.t(key, {
    ns: "zod",
    ...options,
  });
}

export { z, zodT };
