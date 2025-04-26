import { z } from "zod";

type passwordSchemaType = z.infer<typeof passwordSchema>;

interface PasswordConfirmationInput {
  newPassword: passwordSchemaType;
  confirmPassword: passwordSchemaType;
}

const passwordConfirmationRefinement = (
  { confirmPassword, newPassword }: PasswordConfirmationInput,
  ctx: z.RefinementCtx,
) => {
  if (confirmPassword !== newPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      code: z.ZodIssueCode.custom,
      message: "New password and confirm password do not match.",
    });
  }
};

const customSignInErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
    return { message: "Invalid sign-in provider specified." };
  }
  return { message: ctx.defaultError };
};

export const emailSchema = z
  .string({ message: "Email is required" })
  .email({ message: "Invalid email address" })
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(8, "Password must be at least 8 characters long.")
  .max(32, "Password must be less than 32 characters long.");

export const tokenSchema = z.string().min(1, "Token is required.");

export const signInSchema = z.discriminatedUnion(
  "provider",
  [
    z.object({
      email: emailSchema,
      password: passwordSchema,
      provider: z.literal("sign-in"),
    }),
    z.object({
      provider: z.literal("google"),
    }),
    z.object({
      provider: z.literal("github"),
    }),
  ],
  { errorMap: customSignInErrorMap },
);

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string({ message: "Name is required" })
    .min(3, "Name must be at least 3 characters long.")
    .trim(),
});

export const forgetPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: tokenSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .superRefine(passwordConfirmationRefinement);

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .superRefine(passwordConfirmationRefinement);
