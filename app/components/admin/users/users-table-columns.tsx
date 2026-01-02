import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import {
	AlertTriangleIcon,
	BadgeCheckIcon,
	CalendarIcon,
	CheckIcon,
	MailCheckIcon,
	ShieldUserIcon,
	UserIcon,
} from "lucide-react";
import { DateTimeDisplay } from "~/components/datetime-display";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { UserAvatar } from "~/components/user/user-avatar";
import { getAvatarUrl } from "~/lib/utils";
import type { UserItem } from "./users-table";

const roleFilterFn: FilterFn<UserItem> = (
	row,
	columnId,
	filterValue: string[],
) => {
	if (!filterValue?.length) return true;
	const role = row.getValue(columnId) as string;
	return filterValue.includes(role);
};

const bannedFilterFn: FilterFn<UserItem> = (
	row,
	columnId,
	filterValue: string[],
) => {
	if (!filterValue?.length) return true;
	const banned = row.getValue(columnId) as boolean;
	const bannedStatus = banned ? "banned" : "active";
	return filterValue.includes(bannedStatus);
};

export const getUsersTableColumns = (): ColumnDef<UserItem>[] => [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		size: 28,
		enableSorting: false,
		enableHiding: false,
	},
	{
		header: "User",
		accessorKey: "name",
		cell: ({ row }) => {
			const { avatarUrl } = getAvatarUrl(row.original.image);

			return (
				<div className="flex items-center gap-3">
					<UserAvatar image={avatarUrl} name={row.getValue("name")} size={32} />
					<div>
						<div className="font-medium">{row.getValue("name")}</div>
						<div className="text-muted-foreground text-sm">
							{row.original.email}
						</div>
					</div>
				</div>
			);
		},
		size: 200,
		enableHiding: false,
	},
	{
		header: "ID",
		accessorKey: "id",
		cell: ({ row }) => (
			<span className="font-mono text-muted-foreground text-xs">
				{(row.getValue("id") as string).slice(-8)}
			</span>
		),
		size: 80,
	},
	{
		header: "Role",
		accessorKey: "role",
		cell: ({ row }) => (
			<Badge
				variant={row.original.role === "admin" ? "default" : "secondary"}
				className="gap-1 px-1.5 capitalize"
			>
				{row.original.role === "admin" ? (
					<ShieldUserIcon className="size-3" />
				) : (
					<UserIcon className="size-3" />
				)}
				{row.original.role}
			</Badge>
		),
		size: 80,
		filterFn: roleFilterFn,
	},
	{
		header: "Status",
		accessorKey: "banned",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				{row.original.banned ? (
					<Badge variant="destructive" className="gap-1">
						<AlertTriangleIcon className="h-3 w-3" />
						Banned
					</Badge>
				) : (
					<Badge variant="outline" className="gap-1 text-emerald-600">
						<CheckIcon className="h-3 w-3" />
						Active
					</Badge>
				)}
			</div>
		),
		size: 100,
		filterFn: bannedFilterFn,
	},
	{
		header: "Email Verified",
		accessorKey: "emailVerified",
		cell: ({ row }) => (
			<div className="flex items-center justify-center gap-1">
				{row.original.emailVerified ? (
					<BadgeCheckIcon className="size-4 text-emerald-600" />
				) : (
					<MailCheckIcon className="size-4 text-muted-foreground" />
				)}
				<span className="sr-only">
					{row.original.emailVerified ? "Verified" : "Not Verified"}
				</span>
			</div>
		),
		size: 90,
	},
	{
		header: "Created At",
		accessorKey: "createdAt",
		cell: ({ row }) => (
			<div className="flex items-center gap-1 text-muted-foreground text-sm">
				<CalendarIcon className="h-3 w-3" />
				<DateTimeDisplay date={row.original.createdAt} />
			</div>
		),
		size: 100,
	},
];
