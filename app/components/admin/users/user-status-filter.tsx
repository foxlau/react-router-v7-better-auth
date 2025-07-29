import type { Table } from "@tanstack/react-table";
import { FilterIcon } from "lucide-react";
import { useId, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import type { UserItem } from "./users-table";

interface UserStatusFilterProps {
  table: Table<UserItem>;
}

export function UserStatusFilter({ table }: UserStatusFilterProps) {
  const id = useId();

  // Role filter
  const roleColumn = table.getColumn("role");
  const roleFacetedValues = roleColumn?.getFacetedUniqueValues();
  const roleFilterValue = roleColumn?.getFilterValue();

  // Banned filter
  const bannedColumn = table.getColumn("banned");
  const bannedFilterValue = bannedColumn?.getFilterValue();

  const uniqueRoleValues = useMemo(() => {
    if (!roleColumn) return [];
    const values = Array.from(roleFacetedValues?.keys() ?? []);
    return values.sort();
  }, [roleColumn, roleFacetedValues]);

  const roleCounts = useMemo(() => {
    if (!roleColumn) return new Map();
    return roleFacetedValues ?? new Map();
  }, [roleColumn, roleFacetedValues]);

  const selectedRoles = useMemo(() => {
    return (roleFilterValue as string[]) ?? [];
  }, [roleFilterValue]);

  const selectedStatuses = useMemo(() => {
    return (bannedFilterValue as string[]) ?? [];
  }, [bannedFilterValue]);

  const handleRoleChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("role")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("role")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("banned")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("banned")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const totalActiveFilters = selectedRoles.length + selectedStatuses.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <FilterIcon
            className="-ms-1.5 size-4 text-muted-foreground/60"
            size={16}
            aria-hidden="true"
          />
          Filter
          {totalActiveFilters > 0 && (
            <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
              {totalActiveFilters}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-48 p-3" align="end">
        <div className="space-y-4">
          {/* Role Filter */}
          <div className="space-y-3">
            <div className="font-medium text-muted-foreground/60 text-xs uppercase">
              Role
            </div>
            <div className="space-y-2">
              {uniqueRoleValues.map((value, i) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${id}-role-${i}`}
                    checked={selectedRoles.includes(value)}
                    onCheckedChange={(checked: boolean) =>
                      handleRoleChange(checked, value)
                    }
                  />
                  <Label
                    htmlFor={`${id}-role-${i}`}
                    className="flex grow justify-between gap-2 font-normal capitalize"
                  >
                    {value}{" "}
                    <span className="ms-2 text-muted-foreground text-xs">
                      {roleCounts.get(value)}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <div className="font-medium text-muted-foreground/60 text-xs uppercase">
              Status
            </div>
            <div className="space-y-2">
              {["active", "banned"].map((value, i) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${id}-status-${i}`}
                    checked={selectedStatuses.includes(value)}
                    onCheckedChange={(checked: boolean) =>
                      handleStatusChange(checked, value)
                    }
                  />
                  <Label
                    htmlFor={`${id}-status-${i}`}
                    className="flex grow justify-between gap-2 font-normal capitalize"
                  >
                    {value}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
