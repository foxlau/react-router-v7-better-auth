import {
	type ColumnDef,
	flexRender,
	type Table as ReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	table: ReactTable<TData>;
	emptyMessage?: string;
}

export function DataTable<TData, TValue>({
	columns,
	table,
	emptyMessage = "No results.",
}: DataTableProps<TData, TValue>) {
	return (
		<Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id} className="hover:bg-transparent">
						{headerGroup.headers.map((header) => {
							return (
								<TableHead
									key={header.id}
									style={{ width: `${header.getSize()}px` }}
									className="relative h-9 select-none border-border border-y bg-sidebar first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r"
								>
									{header.isPlaceholder ? null : header.column.getCanSort() ? (
										// biome-ignore lint/a11y/noStaticElementInteractions: false positive
										<div
											className={cn(
												header.column.getCanSort() &&
													"flex h-full cursor-pointer select-none items-center gap-2",
											)}
											onClick={header.column.getToggleSortingHandler()}
											onKeyDown={(e) => {
												// Enhanced keyboard handling for sorting
												if (
													header.column.getCanSort() &&
													(e.key === "Enter" || e.key === " ")
												) {
													e.preventDefault();
													header.column.getToggleSortingHandler()?.(e);
												}
											}}
											tabIndex={header.column.getCanSort() ? 0 : undefined}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
											{{
												asc: (
													<ArrowUpIcon
														className="shrink-0 opacity-60"
														size={16}
														aria-hidden="true"
													/>
												),
												desc: (
													<ArrowDownIcon
														className="shrink-0 opacity-60"
														size={16}
														aria-hidden="true"
													/>
												),
											}[header.column.getIsSorted() as string] ?? null}
										</div>
									) : (
										flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)
									)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<tbody aria-hidden="true" className="table-row h-1" />
			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow
							key={row.id}
							data-state={row.getIsSelected() && "selected"}
							className="h-px border-0 hover:bg-accent/50 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id} className="h-[inherit] last:py-0">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
						<TableCell colSpan={columns.length} className="h-24 text-center">
							{emptyMessage}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
			<tbody aria-hidden="true" className="table-row h-1" />
		</Table>
	);
}
