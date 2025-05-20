import { MehIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { buttonVariants } from "./ui/button";

type ErrorDisplayProps = {
  message: string;
  details: string;
  stack?: string;
};

const ERROR_STATUS_MAP: Record<
  number,
  { message: string; defaultDetails: string }
> = {
  400: {
    message: "400 Bad Request",
    defaultDetails: "The request was invalid.",
  },
  401: {
    message: "401 Unauthorized Access",
    defaultDetails:
      "Please log in with the appropriate credentials to access this resource.",
  },
  403: {
    message: "403 Access Forbidden",
    defaultDetails:
      "You don't have necessary permission to view this resource.",
  },
  500: {
    message: "Oops! Something went wrong :')",
    defaultDetails:
      "We apologize for the inconvenience. Please try again later.",
  },
  503: {
    message: "503 Website is under maintenance!",
    defaultDetails:
      "The site is not available at the moment. We'll be back online shortly.",
  },
};

function DevErrorDisplay({ message, details, stack }: ErrorDisplayProps) {
  return (
    <main className="container mx-auto space-y-4 p-4 pt-16">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">{message}</h1>
        <p className="text-balance text-base">{details}</p>
      </div>
      <pre className="w-full overflow-x-auto rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
        <code>{stack}</code>
      </pre>
    </main>
  );
}

export function ProductionErrorDisplay({
  message,
  details,
}: ErrorDisplayProps) {
  return (
    <main className="flex min-h-screen items-center px-6 py-12">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-muted p-3">
          <MehIcon className="size-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-xl md:text-2xl">{message}</h1>
          <p className="text-base text-muted-foreground">{details}</p>
        </div>

        <a href="/" className={buttonVariants()}>
          Back to home
        </a>
      </div>
    </main>
  );
}

export function GeneralErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  const defaultMessage = t("errors.crashed.title");
  const defaultDetails = t("errors.crashed.description");

  // Handle route errors, Example: 404, 500, 503
  if (isRouteErrorResponse(error)) {
    const errorConfig = ERROR_STATUS_MAP[error.status];
    const message = errorConfig?.message ?? defaultMessage;
    const details =
      error.statusText || errorConfig?.defaultDetails || defaultDetails;
    return <ProductionErrorDisplay message={message} details={details} />;
  }

  // Handle development errors
  if (import.meta.env.DEV && error && error instanceof Error) {
    console.log("🔴 error on dev", error);
    return (
      <DevErrorDisplay
        message={defaultMessage}
        details={error.message}
        stack={error.stack}
      />
    );
  }

  // Handle other errors
  return (
    <ProductionErrorDisplay message={defaultMessage} details={defaultDetails} />
  );
}
