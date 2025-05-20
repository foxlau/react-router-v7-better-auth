import { z } from "~/lib/validations/zod-i18n";
import { supportedLngs } from "./config";

export const LocaleSchema = z.object({
  locale: z.enum(supportedLngs),
  returnTo: z.string().optional(),
});

export type LocaleFormData = z.infer<typeof LocaleSchema>;
