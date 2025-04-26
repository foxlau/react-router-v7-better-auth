import { z } from "zod";

export const todoTitleSchema = z
  .string({ message: "Todo title is required" })
  .min(10, {
    message: "Todo title must be at least 10 characters long",
  })
  .max(255, {
    message: "Todo title must be less than 255 characters long",
  });

export const todoIdSchema = z.string().transform((val) => Number(val));

export const todoActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("delete"),
    todoId: todoIdSchema,
  }),
  z.object({
    intent: z.literal("add"),
    title: todoTitleSchema,
  }),
  z.object({
    intent: z.literal("complete"),
    todoId: todoIdSchema,
  }),
]);
