import { ArrowLeftIcon } from "lucide-react";
import { Link, Outlet } from "react-router";
import { Button } from "~/components/ui/button";
import { noAuthMiddleware } from "~/lib/middlewares/auth-guard.server";

export const unstable_middleware = [noAuthMiddleware];

export async function loader() {
  return null;
}

export default function AuthLayout() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Button variant="ghost" size="sm" className="fixed top-4 left-4" asChild>
        <Link to="/">
          <ArrowLeftIcon className="size-4" /> Home
        </Link>
      </Button>
      <div className="mx-auto w-[300px] sm:w-[360px]">
        <Outlet />
      </div>
    </div>
  );
}
