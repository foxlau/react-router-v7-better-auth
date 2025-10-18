import { ErrorDisplay } from "~/components/error-boundary";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => [{ title: "Not Found" }];

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export async function action() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
  return <ErrorBoundary />;
}

export function ErrorBoundary() {
  return (
    <ErrorDisplay
      message="Oops! Page Not Found."
      detail="It seems like the page you're looking for does not exist or might have been removed."
    />
  );
}
