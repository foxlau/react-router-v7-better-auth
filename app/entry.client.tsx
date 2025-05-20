import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";
import { config } from "~/lib/i18n/config";

async function main() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...config,
      detection: { order: ["htmlTag"], caches: [] },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

main().catch((error) => console.error(error));
