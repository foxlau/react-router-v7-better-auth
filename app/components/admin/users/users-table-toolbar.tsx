import type { Table } from "@tanstack/react-table";
import { AlertCircleIcon, SearchIcon, TrashIcon, XIcon } from "lucide-react";
import { useId, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { UserStatusFilter } from "./user-status-filter";
import type { UserItem } from "./users-table";

interface UsersTableToolbarProps {
  table: Table<UserItem>;
  onDeleteRows: () => void;
}

export function UsersTableToolbar({
  table,
  onDeleteRows,
}: UsersTableToolbarProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left side - Search */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            id={`${id}-input`}
            ref={inputRef}
            className={cn(
              "peer min-w-60 bg-background bg-gradient-to-br from-accent/60 to-accent ps-9",
              Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9",
            )}
            value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
            }
            placeholder="Search by name"
            type="text"
            aria-label="Search by name"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
            <SearchIcon size={16} aria-hidden="true" />
          </div>
          {Boolean(table.getColumn("name")?.getFilterValue()) && (
            <button
              type="button"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/60 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Clear filter"
              onClick={() => {
                table.getColumn("name")?.setFilterValue("");
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <XIcon size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Right side - Actions and Filters */}
      <div className="flex items-center gap-3">
        {/* Delete button */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="ml-auto" variant="outline">
                <TrashIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Delete
                <span className="ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                  {table.getSelectedRowModel().rows.length}
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                  aria-hidden="true"
                >
                  <AlertCircleIcon className="opacity-80" size={16} />
                </div>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete{" "}
                    {table.getSelectedRowModel().rows.length} selected{" "}
                    {table.getSelectedRowModel().rows.length === 1
                      ? "user"
                      : "users"}
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(buttonVariants({ variant: "destructive" }))}
                  onClick={onDeleteRows}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Filter */}
        <UserStatusFilter table={table} />
      </div>
    </div>
  );
}
