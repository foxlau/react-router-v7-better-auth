import { Outlet } from "react-router";

import { Menu } from "~/components/settings/settings-menu";
import type { Route } from "./+types/layout";

export default function Layout(_: Route.ComponentProps) {
  return (
    <>
      <Menu />
      <Outlet />
    </>
  );
}
