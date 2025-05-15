import { Outlet } from "react-router";
import { noAuthMiddleware } from "~/middlewares/auth-guard.server";

export const unstable_middleware = [noAuthMiddleware];

export async function loader() {
  return null;
}

export default function AuthLayout() {
  return <Outlet />;
}
