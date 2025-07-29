import { ArrowLeftIcon, ShieldAlert } from "lucide-react";
import { Link, type LoaderFunctionArgs, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import { serverAuth } from "~/lib/auth/auth.server";

export const meta = () => [{ title: "Authentication Error" }];

export async function loader({ request }: LoaderFunctionArgs) {
  return serverAuth.handler(request);
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

        <h1 className="mt-2 font-semibold text-xl md:text-2xl">
          Authentication Error
        </h1>

        <p className="mt-2 text-muted-foreground">
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

        <p className="mt-6 text-muted-foreground text-xs underline decoration-1 decoration-muted-foreground/30 decoration-wavy underline-offset-2">
          Error code: {error}
        </p>
      </div>
    </div>
  );
}
