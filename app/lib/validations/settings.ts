import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const accountSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("delete-account"),
  }),
  z.object({
    intent: z.literal("delete-avatar"),
  }),
  z.object({
    intent: z.literal("set-avatar"),
    image: z
      .instanceof(File)
      .refine((file) => file.size > 0, "File is required.")
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        `Max file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      )
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported.",
      ),
  }),
]);
