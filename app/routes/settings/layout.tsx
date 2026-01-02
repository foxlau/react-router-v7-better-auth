import { Outlet } from "react-router";
import { Menu } from "~/components/settings/settings-menu";
import type { Route } from "./+types/layout";

export default function Layout(_: Route.ComponentProps) {
	return (
		<>
			<div className="flex flex-col gap-4">
				<h2 className="font-bold text-xl">Settings</h2>
				<Menu />
			</div>
			<Outlet />
		</>
	);
}
