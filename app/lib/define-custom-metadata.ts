import type { BaseMetadata } from "@conform-to/react/future";
import type { ComponentProps } from "react";
import type { Checkbox } from "~/components/ui/checkbox";
import type { Input } from "~/components/ui/input";
import type { RadioGroup } from "~/components/ui/radio-group";
import type { Select } from "~/components/ui/select";
import type { Switch } from "~/components/ui/switch";
import type { Textarea } from "~/components/ui/textarea";

/**
 * Define custom metadata for the form field.
 *
 * @param metadata - The metadata to define.
 * @returns The input props to be used in the form field.
 *
 * @example
 * ```tsx
 * // Used globally via FormOptionsProvider in layout.tsx or route.tsx
 * <FormOptionsProvider defineCustomMetadata={defineCustomMetadata}>
 *   <App />
 * </FormOptionsProvider>
 *
 * // Then you can access the inputProps in any form field.
 * const { fields } = useForm({ ... });
 *
 * <Field label="Email" field={fields.email}>
 *  <Input type="email" {...fields.email.inputProps} />
 * </Field>
 * ```
 *
 * @see {@link https://conform.guide/api/react/future/FormOptionsProvider | Conform FormOptionsProvider}
 */
export function defineCustomMetadata<FieldShape, ErrorShape>(
	metadata: BaseMetadata<FieldShape, ErrorShape>,
) {
	return {
		get inputProps() {
			return {
				id: metadata.id,
				name: metadata.name,
				defaultValue: metadata.defaultValue,
				required: metadata.required,
				minLength: metadata.minLength,
				maxLength: metadata.maxLength,
				pattern: metadata.pattern,
				min: metadata.min,
				max: metadata.max,
				step: metadata.step,
				"aria-invalid": metadata.ariaInvalid,
				"aria-describedby": metadata.ariaDescribedBy,
			} satisfies Partial<ComponentProps<typeof Input>>;
		},
		get textareaProps() {
			return {
				id: metadata.id,
				name: metadata.name,
				defaultValue: metadata.defaultValue,
				required: metadata.required,
				"aria-invalid": metadata.ariaInvalid,
				"aria-describedby": metadata.ariaDescribedBy,
			} satisfies Partial<ComponentProps<typeof Textarea>>;
		},
		get selectProps() {
			return {
				name: metadata.name,
				defaultValue: metadata.defaultValue,
				required: metadata.required,
			} satisfies Partial<ComponentProps<typeof Select>>;
		},
		get checkboxProps() {
			return {
				name: metadata.name,
				value: "on",
				defaultChecked: metadata.defaultChecked,
			} satisfies Partial<React.ComponentProps<typeof Checkbox>>;
		},
		get radioGroupProps() {
			return {
				name: metadata.name,
				defaultValue: metadata.defaultValue,
			} satisfies Partial<React.ComponentProps<typeof RadioGroup>>;
		},
		get switchProps() {
			return {
				id: metadata.id,
				name: metadata.name,
				defaultChecked: metadata.defaultChecked,
				required: metadata.required,
			} satisfies Partial<ComponentProps<typeof Switch>>;
		},
	};
}

declare module "@conform-to/react/future" {
	interface CustomMetadata<FieldShape, ErrorShape>
		extends ReturnType<typeof defineCustomMetadata<FieldShape, ErrorShape>> {}
}
