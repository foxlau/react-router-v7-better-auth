import { ArrowLeftIcon, ShieldAlert } from "lucide-react";
import { Link, useSearchParams, type LoaderFunctionArgs } from "react-router";

import { serverAuth } from "~/auth/auth.server";
import { Button } from "~/components/ui/button";

export const meta = () => [{ title: "Authentication Error" }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = serverAuth(context.cloudflare.env);
  return auth.handler(request);
}

export default function BetterError() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="container mx-auto flex min-h-screen items-center px-6 py-12">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <p className="rounded-full bg-muted p-3 font-medium">
          <ShieldAlert className="h-6 w-6" />
        </p>

        <h1 className="mt-3 text-2xl font-semibold md:text-3xl">
          Authentication Error
        </h1>

        <p className="mt-4 text-muted-foreground">
          We encountered an issue while processing your request. Please try
          again or contact the application owner if the problem persists.
        </p>

        <div className="mt-6 flex w-full shrink-0 items-center justify-center space-x-3">
          <Button variant="outline" asChild>
            <Link to="/auth/sign-in">
              <ArrowLeftIcon className="size-4" />
              Go to sign in
            </Link>
          </Button>

          <Button asChild>
            <Link to="/">Take me home</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground underline decoration-muted-foreground/30 decoration-wavy decoration-1 underline-offset-2">
          Error code: {error}
        </p>
      </div>
    </div>
  );
}
