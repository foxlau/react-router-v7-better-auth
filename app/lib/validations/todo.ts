import { z } from "zod/v4";

export const todoIdSchema = z.string().transform((val) => Number(val));

export const todoSchema = z.discriminatedUnion("intent", [
	z.object({
		intent: z.literal("delete"),
		id: todoIdSchema,
	}),
	z.object({
		intent: z.literal("toggle"),
		id: todoIdSchema,
	}),
	z.object({
		intent: z.literal("create"),
		title: z
			.string({ message: "Todo title is required." })
			.min(10, {
				message: "Todo title must be at least 10 characters long.",
			})
			.max(255, {
				message: "Todo title must be less than 255 characters long.",
			}),
	}),
]);
