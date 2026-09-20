export type JobStatus = "Pending" | "In Progress" | "Delayed" | "Completed";

export interface Job {
  id: string;
  productName: string;
  customer: string;
  quantity: number;
  dueDate: string;
  status: JobStatus;
  machine: string;
  notes: string;
}

export interface Machine {
  id: string;
  name: string;
  status: "Running" | "Idle" | "Maintenance" | "Offline";
}

export const JOB_STATUSES: JobStatus[] = [
  "Pending",
  "In Progress",
  "Delayed",
  "Completed",
];

export type SortField = "dueDate" | "quantity";
export type SortOrder = "asc" | "desc";
