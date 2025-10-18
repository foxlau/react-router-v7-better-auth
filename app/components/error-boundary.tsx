import { MehIcon } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { buttonVariants } from "./ui/button";

function DevErrorDisplay({
  message,
  detail,
  stack,
}: {
  message: string;
  detail: string;
  stack?: string;
}) {
  return (
    <main className="space-y-4 p-4 sm:p-8">
      <div className="space-y-1">
        <h1 className="font-semibold text-lg">{message}</h1>
        <p className="break-words text-base text-muted-foreground">{detail}</p>
      </div>
      {stack && (
        <pre className="max-h-96 w-full overflow-x-auto overflow-y-auto rounded-lg bg-destructive/5 p-4 text-destructive text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function ErrorDisplay({
  message,
  detail,
}: {
  message: string;
  detail: string;
}) {
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

export function GeneralErrorBoundary() {
  const error = useRouteError();
  const isDev = import.meta.env.DEV;
  let message = "Oops! Application Error.";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 Not Found" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (isDev && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  if (isDev && stack) {
    return <DevErrorDisplay message={message} detail={details} stack={stack} />;
  }

  return <ErrorDisplay message={message} detail={details} />;
}
