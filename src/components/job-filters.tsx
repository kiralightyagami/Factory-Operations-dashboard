import React from "react";
import { Job, JobStatus, SortField, SortOrder } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobFiltersProps {
  jobs: Job[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: JobStatus | "all";
  onStatusFilterChange: (status: JobStatus | "all") => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;
  filteredCount: number;
  totalCount: number;
}

const STATUS_TABS: Array<{ label: string; value: JobStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "In Progress" },
  { label: "Pending", value: "Pending" },
  { label: "Delayed", value: "Delayed" },
  { label: "Completed", value: "Completed" },
];

export const JobFilters: React.FC<JobFiltersProps> = ({
  jobs,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderToggle,
  filteredCount,
  totalCount,
}) => {
  const countsByStatus = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: jobs.length,
      Pending: 0,
      "In Progress": 0,
      Delayed: 0,
      Completed: 0,
    };
    for (const job of jobs) {
      if (counts[job.status] !== undefined) {
        counts[job.status]++;
      }
    }
    return counts;
  }, [jobs]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const handleResetFilters = () => {
    onSearchChange("");
    onStatusFilterChange("all");
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by product, customer, job ID, or machine..."
            className="pl-8 pr-8 text-sm h-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            <span>Sort by:</span>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onSortFieldChange("dueDate")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-all duration-200",
                sortField === "dueDate"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Due Date
            </button>
            <button
              type="button"
              onClick={() => onSortFieldChange("quantity")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-all duration-200",
                sortField === "quantity"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Quantity
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSortOrderToggle}
            className="h-8 gap-1 text-xs"
            title={`Sort order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            <ArrowUpDown className="size-3" />
            <span>{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count = countsByStatus[tab.value] ?? 0;

            return (
              <button
                key={tab.value}
                onClick={() => onStatusFilterChange(tab.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-semibold",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground border border-border/80"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCount}</span> of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span> work orders
        </div>
      </div>
    </div>
  );
};
