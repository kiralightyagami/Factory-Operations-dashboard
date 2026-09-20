import React from "react";
import { Job, JobStatus, Machine } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Inbox,
  Calendar,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobsTableProps {
  jobs: Job[];
  machines: Machine[];
  selectedJobId: string | null;
  onSelectJob: (job: Job) => void;
  onClearFilters?: () => void;
}

const statusBadgeConfig: Record<
  JobStatus,
  {
    variant: "info" | "warning" | "destructive" | "success";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  "In Progress": { variant: "info", icon: Clock },
  Pending: { variant: "warning", icon: Clock },
  Delayed: { variant: "destructive", icon: AlertCircle },
  Completed: { variant: "success", icon: CheckCircle2 },
};

const machineStatusDot: Record<string, string> = {
  Running: "bg-emerald-500",
  Idle: "bg-slate-400",
  Maintenance: "bg-amber-500",
  Offline: "bg-rose-500",
};

export const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  machines,
  selectedJobId,
  onSelectJob,
  onClearFilters,
}) => {
  const machineMap = React.useMemo(() => {
    const map = new Map<string, Machine>();
    for (const m of machines) {
      map.set(m.name, m);
    }
    return map;
  }, [machines]);

  const getDueBadge = (dueDateStr: string, status: JobStatus) => {
    if (status === "Completed") return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold text-rose-600 dark:text-rose-400">
          Overdue
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold text-amber-600 dark:text-amber-400">
          Due Today
        </span>
      );
    }
    if (diffDays === 1) {
      return (
        <span className="inline-flex items-center text-[10px] font-medium text-amber-500">
          Due Tomorrow
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-foreground">
          No work orders found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          No production jobs match your current search query or filter settings.
        </p>
        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-4"
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="py-3 pl-4 pr-3">Job ID</th>
              <th className="py-3 px-3">Product / Part</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3 text-right">Quantity</th>
              <th className="py-3 px-3">Due Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Assigned Machine</th>
              <th className="py-3 pl-2 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const statusInfo = statusBadgeConfig[job.status];
              const StatusIcon = statusInfo.icon;
              const machine = machineMap.get(job.machine);
              const dueBadge = getDueBadge(job.dueDate, job.status);

              return (
                <tr
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className={cn(
                    "group cursor-pointer transition-colors duration-200 hover:bg-muted/50",
                    isSelected && "bg-muted/70 ring-1 ring-inset ring-primary/20",
                    job.status === "Delayed" && "bg-rose-500/[0.02]"
                  )}
                >
                  <td className="py-3.5 pl-4 pr-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                    <span className="rounded bg-muted px-1.5 py-0.5 border border-border">
                      {job.id}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-medium text-foreground text-sm">
                      {job.productName}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-muted-foreground text-xs whitespace-nowrap">
                    {job.customer}
                  </td>

                  <td className="py-3.5 px-3 text-right tabular-nums whitespace-nowrap font-medium text-foreground">
                    {job.quantity.toLocaleString()}{" "}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      units
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs text-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatDate(job.dueDate)}
                      </span>
                      {dueBadge}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge variant={statusInfo.variant} className="gap-1 font-medium">
                      <StatusIcon className="size-3" />
                      {job.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          machine
                            ? machineStatusDot[machine.status] || "bg-slate-400"
                            : "bg-slate-400"
                        )}
                        title={machine ? `Machine status: ${machine.status}` : undefined}
                      />
                      <span className="text-xs font-medium text-foreground flex items-center gap-1">
                        <Cpu className="size-3 text-muted-foreground" />
                        {job.machine}
                      </span>
                      {machine && (
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          ({machine.status})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 pl-2 pr-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectJob(job);
                      }}
                      className="opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label={`View details for ${job.id}`}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
