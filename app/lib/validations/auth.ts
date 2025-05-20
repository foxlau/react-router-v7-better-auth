import { z, zodT } from "./zod-i18n";

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
      // message: "New password and confirm password do not match.",
      params: { i18n: "custom.passwordNotMatch" },
    });
  }
};

const customSignInErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
    return { message: "Invalid sign-in provider specified." };
  }
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (
      issue.expected === "string" &&
      ["undefined", "null"].includes(issue.received)
    ) {
      return {
        message: zodT("custom.isRequired", {
          field: zodT(`custom.${issue.path[0]}`),
        }),
      };
    }
  }
  return { message: ctx.defaultError };
};

export const emailSchema = z
  .string({ errorMap: customSignInErrorMap })
  .email()
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string({ errorMap: customSignInErrorMap })
  .min(8)
  .max(32);

export const tokenSchema = z.string().min(1);

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
  name: z.string().min(3).trim(),
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
  // .refine(() => false, { params: { i18n: "test_custom_key" } });
  .superRefine(passwordConfirmationRefinement);

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .superRefine(passwordConfirmationRefinement);
