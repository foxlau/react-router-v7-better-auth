/**
 * The users page is currently just a sample and will be improved in the future.
 */

import { data, href } from "react-router";
import { UsersTable } from "~/components/admin/users/users-table";
import { getPageTitle } from "~/lib/utils";
import { db } from "~/services/db.server";
import type { Route } from "./+types/index";

export function meta() {
	return [{ title: getPageTitle("Users") }];
}

export const handle = {
	breadcrumb: () => ({ label: "Users", to: href("/admin/users") }),
};

export async function loader(_: Route.LoaderArgs) {
	const users = await db.query.users.findMany();
	return data({
		users,
	});
}

export default function UsersPage({
	loaderData: { users },
}: Route.ComponentProps) {
	return (
		<>
			<header className="flex items-center justify-between gap-4">
				<h1 className="font-semibold text-xl">
					Users
					<span className="ml-2 text-muted-foreground text-sm">
						({users.length})
					</span>
				</h1>
			</header>
			<UsersTable data={users} />
		</>
	);
}
