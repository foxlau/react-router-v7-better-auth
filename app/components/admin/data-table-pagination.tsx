import type { Table } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "~/components/ui/pagination";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

export function DataTablePagination<TData>({
	table,
}: DataTablePaginationProps<TData>) {
	if (table.getRowModel().rows.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center justify-between gap-3">
			<p
				className="flex-1 whitespace-nowrap text-muted-foreground text-sm"
				aria-live="polite"
			>
				Page{" "}
				<span className="text-foreground">
					{table.getState().pagination.pageIndex + 1}
				</span>{" "}
				of <span className="text-foreground">{table.getPageCount()}</span>
			</p>
			<Pagination className="w-auto">
				<PaginationContent className="gap-3">
					<PaginationItem>
						<Button
							variant="outline"
							className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							aria-label="Go to previous page"
						>
							Previous
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							variant="outline"
							className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							aria-label="Go to next page"
						>
							Next
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
