import React from "react";
import { Job, JobStatus, Machine, JOB_STATUSES } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  Boxes,
  Cpu,
  FileText,
  Save,
  Check,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobDetailPanelProps {
  job: Job | null;
  machine?: Machine;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (jobId: string, newStatus: JobStatus) => Promise<void> | void;
  onUpdateNotes: (jobId: string, newNotes: string) => Promise<void> | void;
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

const machineStatusStyles: Record<
  string,
  { dot: string; text: string; bg: string; border: string }
> = {
  Running: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  Idle: {
    dot: "bg-slate-400",
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
  Maintenance: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  Offline: {
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

export const JobDetailPanel: React.FC<JobDetailPanelProps> = ({
  job,
  machine,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
}) => {
  const [isEditingNotes, setIsEditingNotes] = React.useState(false);
  const [editedNotes, setEditedNotes] = React.useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    if (job) {
      setEditedNotes(job.notes);
      setIsEditingNotes(false);
      setSavedSuccess(false);
    }
  }, [job]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const currentStatusConfig = statusBadgeConfig[job.status];
  const CurrentStatusIcon = currentStatusConfig.icon;
  const mStyle = machine
    ? machineStatusStyles[machine.status] || machineStatusStyles.Idle
    : machineStatusStyles.Idle;

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (newStatus === job.status || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(job.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    await onUpdateNotes(job.id, editedNotes);
    setIsEditingNotes(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md pointer-events-auto border-l border-border bg-card text-card-foreground shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold rounded bg-muted px-2 py-0.5 border border-border text-foreground">
                  {job.id}
                </span>
                <Badge variant={currentStatusConfig.variant} className="gap-1">
                  <CurrentStatusIcon className="size-3" />
                  {job.status}
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-foreground leading-tight pt-1">
                {job.productName}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Close panel"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Update Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {JOB_STATUSES.map((status) => {
                  const isActive = job.status === status;
                  return (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        "justify-start text-xs h-9 font-medium",
                        isActive && "font-semibold shadow-xs",
                        !isActive &&
                          status === "Delayed" &&
                          "hover:text-rose-600 hover:border-rose-300",
                        !isActive &&
                          status === "Completed" &&
                          "hover:text-emerald-600 hover:border-emerald-300"
                      )}
                    >
                      {isActive ? (
                        <Check className="size-3.5 mr-1.5 shrink-0" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground mr-2 shrink-0" />
                      )}
                      {status}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Job Overview
              </label>
              <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    Customer
                  </span>
                  <span className="font-medium text-foreground">{job.customer}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Boxes className="size-3.5" />
                    Batch Quantity
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {job.quantity.toLocaleString()} units
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Due Date
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(job.dueDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Workcenter
              </label>
              <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {job.machine}
                      </div>
                      {machine && (
                        <div className="text-[11px] font-mono text-muted-foreground">
                          ID: {machine.id}
                        </div>
                      )}
                    </div>
                  </div>

                  {machine && (
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border",
                        mStyle.bg,
                        mStyle.text,
                        mStyle.border
                      )}
                    >
                      <span className={cn("size-2 rounded-full", mStyle.dot)} />
                      <span>{machine.status}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <Activity className="size-3.5" />
                  <span>
                    Routing: Direct operation on primary factory cell
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  Notes & Issues
                </label>
                {!isEditingNotes && (
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Edit Note
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Enter operation notes, delays, or inspection results..."
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditedNotes(job.notes);
                        setIsEditingNotes(false);
                      }}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveNotes}
                      className="text-xs h-7 gap-1"
                    >
                      <Save className="size-3" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-foreground leading-relaxed min-h-[70px]">
                  {job.notes ? (
                    job.notes
                  ) : (
                    <span className="text-muted-foreground italic">
                      No notes recorded for this work order.
                    </span>
                  )}
                </div>
              )}

              {savedSuccess && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="size-3" /> Note updated successfully
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-border p-4 bg-muted/10 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close Panel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
