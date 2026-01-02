import type { Route } from ".react-router/types/app/routes/admin/users/+types";
import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "~/components/admin/data-table";
import { DataTablePagination } from "~/components/admin/data-table-pagination";
import { getUsersTableColumns } from "./users-table-columns";
import { UsersTableToolbar } from "./users-table-toolbar";

export type UsersData = Route.ComponentProps["loaderData"]["users"];
export type UserItem = UsersData[number];

export function UsersTable({ data }: { data: UsersData }) {
	const [tableData, setTableData] = useState<UsersData>(data);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "name",
			desc: false,
		},
	]);

	const columns = useMemo(() => getUsersTableColumns(), []);

	const handleDeleteRows = () => {
		const selectedRows = table.getSelectedRowModel().rows;
		const updatedData = tableData.filter(
			(item) => !selectedRows.some((row) => row.original.id === item.id),
		);
		setTableData(updatedData);
		table.resetRowSelection();
	};

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		state: {
			sorting,
			pagination,
			columnFilters,
			columnVisibility,
		},
	});

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<UsersTableToolbar table={table} onDeleteRows={handleDeleteRows} />

			{/* Table */}
			<DataTable
				columns={columns}
				data={tableData}
				table={table}
				emptyMessage="No users found."
			/>

			{/* Pagination */}
			<DataTablePagination table={table} />
		</div>
	);
}
