"use client";

import React from "react";
import { Job, JobStatus, SortField, SortOrder } from "@/lib/types";
import { mockJobs, machines } from "@/lib/mock-data";
import { SummaryCards } from "@/components/summary-cards";
import { JobFilters } from "@/components/job-filters";
import { JobsTable } from "@/components/jobs-table";
import { JobDetailPanel } from "@/components/job-detail-panel";
import { Button } from "@/components/ui/button";
import {
  Factory,
  RefreshCw,
  Activity,
  CheckCircle2,
} from "lucide-react";

export const Dashboard = () => {
  const [jobs, setJobs] = React.useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<JobStatus | "all">("all");
  const [sortField, setSortField] = React.useState<SortField>("dueDate");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<string>("Just now");

  const refreshJobs = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        setLastSyncTime(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      }
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  const selectedJob = React.useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  const selectedMachine = React.useMemo(() => {
    if (!selectedJob) return undefined;
    return machines.find((m) => m.name === selectedJob.machine);
  }, [selectedJob]);

  const handleSelectJob = (job: Job) => {
    setSelectedJobId(job.id);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleStatusUpdate = async (jobId: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    try {
      await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId, status: newStatus }),
      });
    } catch {
    }
  };

  const handleNotesUpdate = async (jobId: string, newNotes: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, notes: newNotes } : job
      )
    );

    try {
      await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId, notes: newNotes }),
      });
    } catch {
    }
  };

  const filteredAndSortedJobs = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let result = jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.productName.toLowerCase().includes(query) ||
        job.customer.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query) ||
        job.machine.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "dueDate") {
        comparison =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortField === "quantity") {
        comparison = a.quantity - b.quantity;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [jobs, searchQuery, statusFilter, sortField, sortOrder]);

  const handleSortOrderToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Factory className="size-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Production Control Dashboard
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap pt-0.5">
            <span>Plant 04 • Fabrication & Assembly</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span>Shift 1 (06:00 - 14:00)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground hidden md:inline">
            Synced: {lastSyncTime}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshJobs}
            disabled={isRefreshing}
            className="text-xs h-8 gap-1.5"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </header>

      <section aria-label="Operational Metrics">
        <SummaryCards
          jobs={jobs}
          selectedStatus={statusFilter}
          onStatusSelect={setStatusFilter}
        />
      </section>

      <section aria-label="Filters and Search">
        <JobFilters
          jobs={jobs}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortOrder={sortOrder}
          onSortOrderToggle={handleSortOrderToggle}
          filteredCount={filteredAndSortedJobs.length}
          totalCount={jobs.length}
        />
      </section>

      <section aria-label="Work Orders Table">
        <JobsTable
          jobs={filteredAndSortedJobs}
          machines={machines}
          selectedJobId={selectedJobId}
          onSelectJob={handleSelectJob}
          onClearFilters={handleClearFilters}
        />
      </section>

      <JobDetailPanel
        job={selectedJob}
        machine={selectedMachine}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdateStatus={handleStatusUpdate}
        onUpdateNotes={handleNotesUpdate}
      />
    </div>
  );
};
