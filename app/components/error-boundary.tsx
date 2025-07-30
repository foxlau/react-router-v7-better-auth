import { MehIcon } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { buttonVariants } from "./ui/button";

type ErrorDisplayProps = {
  message: string;
  detail: string;
};

const HTTP_ERROR_CONFIG: Record<number, ErrorDisplayProps> = {
  400: {
    message: "400 Bad Request",
    detail: "The request was invalid.",
  },
  401: {
    message: "401 Unauthorized Access",
    detail:
      "Please log in with the appropriate credentials to access this resource.",
  },
  403: {
    message: "403 Access Forbidden",
    detail: "You don't have necessary permission to view this resource.",
  },
  404: {
    message: "404 Not Found",
    detail: "The resource you are looking for does not exist.",
  },
  500: {
    message: "500 Internal Server Error",
    detail: "We apologize for the inconvenience. Please try again later.",
  },
  503: {
    message: "503 Website is under maintenance!",
    detail:
      "The site is not available at the moment. We'll be back online shortly.",
  },
};

const DEFAULT_ERROR = {
  message: "Oops, something went wrong.",
  detail:
    "Unexpected error. Refresh to try again or contact support if the issue persists.",
};

function DevErrorDisplay({
  message,
  detail,
  stack,
}: ErrorDisplayProps & { stack?: string }) {
  return (
    <main className="container mx-auto space-y-4 p-4 pt-16">
      <div className="space-y-1">
        <h1 className="font-semibold text-lg">{message}</h1>
        <p className="text-base text-muted-foreground">{detail}</p>
      </div>
      {stack && (
        <pre className="w-full overflow-x-auto rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function ProductionErrorDisplay({ message, detail }: ErrorDisplayProps) {
  return (
    <main className="flex h-screen items-center justify-center p-6">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-muted p-3">
          <MehIcon className="size-6" />
        </div>

        <div className="space-y-1">
          <h1 className="font-semibold text-lg">{message}</h1>
          <p className="text-base text-muted-foreground">{detail}</p>
        </div>

        <Link to="/" className={buttonVariants()}>
          Back to home
        </Link>
      </div>
    </main>
  );
}

function getErrorInfo(error: unknown): ErrorDisplayProps {
  if (!isRouteErrorResponse(error)) {
    return DEFAULT_ERROR;
  }

  const httpError = HTTP_ERROR_CONFIG[error.status];

  return {
    message: error.data?.message ?? httpError?.message ?? DEFAULT_ERROR.message,
    detail: error.data?.detail ?? httpError?.detail ?? DEFAULT_ERROR.detail,
  };
}

export function GeneralErrorBoundary() {
  const error = useRouteError();

  if (import.meta.env.DEV && error instanceof Error) {
    console.log("🔴 error on dev", error);
    return (
      <DevErrorDisplay
        message="Application Error"
        detail={error.message}
        stack={error.stack}
      />
    );
  }

  const { message, detail } = getErrorInfo(error);

  return <ProductionErrorDisplay message={message} detail={detail} />;
}
