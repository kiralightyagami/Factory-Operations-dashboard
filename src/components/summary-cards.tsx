import React from "react";
import { Job, JobStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layers,
  AlertTriangle,
  ClockAlert,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  jobs: Job[];
  selectedStatus: JobStatus | "all";
  onStatusSelect: (status: JobStatus | "all") => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  jobs,
  selectedStatus,
  onStatusSelect,
}) => {
  const total = jobs.length;
  const delayed = jobs.filter((j) => j.status === "Delayed").length;
  const completed = jobs.filter((j) => j.status === "Completed").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  const dueSoon = jobs.filter((j) => {
    if (j.status === "Completed") return false;
    const due = new Date(j.dueDate);
    return due <= twoDaysFromNow;
  }).length;

  const inProgress = jobs.filter((j) => j.status === "In Progress").length;

  const cards = [
    {
      id: "total",
      label: "Total Work Orders",
      value: total,
      subtext: `${inProgress} active on floor`,
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      border: "hover:border-blue-500/50",
      activeBorder: "border-blue-500 ring-2 ring-blue-500/20",
      targetStatus: "all" as const,
    },
    {
      id: "delayed",
      label: "Delayed Jobs",
      value: delayed,
      subtext: delayed > 0 ? "Requires line clearance" : "All running on schedule",
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      border: "hover:border-rose-500/50",
      activeBorder: "border-rose-500 ring-2 ring-rose-500/20",
      targetStatus: "Delayed" as const,
      highlight: delayed > 0,
    },
    {
      id: "dueSoon",
      label: "Due Today / Soon",
      value: dueSoon,
      subtext: "Within next 48 hours",
      icon: ClockAlert,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      border: "hover:border-amber-500/50",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20",
      targetStatus: null,
    },
    {
      id: "completed",
      label: "Completed Jobs",
      value: completed,
      subtext: `${total > 0 ? Math.round((completed / total) * 100) : 0}% fulfillment rate`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "hover:border-emerald-500/50",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20",
      targetStatus: "Completed" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected =
          card.targetStatus !== null && selectedStatus === card.targetStatus;

        return (
          <Card
            key={card.id}
            onClick={() => {
              if (card.targetStatus !== null) {
                if (selectedStatus === card.targetStatus && card.targetStatus !== "all") {
                  onStatusSelect("all");
                } else {
                  onStatusSelect(card.targetStatus);
                }
              }
            }}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-sm",
              card.border,
              isSelected ? card.activeBorder : "border-border",
              card.highlight && "border-rose-500/30 bg-rose-500/5"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {card.label}
                </span>
                <div className={cn("rounded-md p-1.5", card.bg, card.color)}>
                  <Icon className="size-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {card.value}
                </span>
                {card.targetStatus !== null && (
                  <span className="inline-flex items-center text-xs text-muted-foreground opacity-60 transition-opacity duration-300 hover:opacity-100">
                    Filter <ArrowUpRight className="size-3 ml-0.5" />
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {card.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
