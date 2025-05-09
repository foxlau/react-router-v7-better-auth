import type { VariantProps } from "class-variance-authority";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";

import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import type { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export interface FormFieldProps {
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: ListOfErrors;
  className?: string;
}

export interface LoadingButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  buttonText: string;
  loadingText: string;
  isPending: boolean;
  className?: string;
}

export function ErrorList({
  id,
  errors,
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul id={id} className="flex flex-col">
      {errorsToRender.map((e) => (
        <li key={e} className="text-destructive text-xs">
          {e}
        </li>
      ))}
    </ul>
  );
}

export function InputField({
  labelProps,
  inputProps,
  errors,
  className,
}: FormFieldProps) {
  const fallbackId = useId();
  const id = inputProps.id || fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <Input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
    </div>
  );
}

export function PasswordField({
  labelProps,
  inputProps,
  errors,
  className,
}: FormFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const fallbackId = useId();
  const id = inputProps.id || fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const { type, ...restInputProps } = inputProps;

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <div className="relative">
        <Input
          id={id}
          className="pr-9"
          type={isVisible ? "text" : "password"}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          {...restInputProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute inset-y-0 right-0 flex h-full items-center justify-center pr-3 text-muted-foreground/80 hover:bg-transparent"
          aria-label={isVisible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </Button>
      </div>
      {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
    </div>
  );
}

export function LoadingButton({
  buttonText,
  loadingText,
  isPending,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <Button type="submit" className={className} disabled={isPending} {...props}>
      {isPending ? (
        <>
          <Spinner /> {loadingText}
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}
