import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";
import { defaultNS, fallbackLng, resources } from "~/lib/i18n";

async function main() {
  const instance = createInstance();
  await instance
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      fallbackLng,
      defaultNS,
      detection: { order: ["htmlTag"], caches: [] },
      resources,
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={instance}>
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

main().catch((error) => console.error(error));
