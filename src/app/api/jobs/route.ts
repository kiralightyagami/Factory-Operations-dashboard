import { NextRequest, NextResponse } from "next/server";
import { mockJobs } from "@/lib/mock-data";
import { JobStatus } from "@/lib/types";

let jobsStore = [...mockJobs];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "dueDate";
  const order = searchParams.get("order") || "asc";

  let jobs = [...jobsStore];

  if (search) {
    jobs = jobs.filter(
      (job) =>
        job.productName.toLowerCase().includes(search) ||
        job.customer.toLowerCase().includes(search) ||
        job.id.toLowerCase().includes(search) ||
        job.machine.toLowerCase().includes(search),
    );
  }

  if (status !== "all") {
    jobs = jobs.filter((job) => job.status === (status as JobStatus));
  }

  if (sort === "dueDate") {
    jobs.sort((a, b) => {
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return order === "desc" ? -diff : diff;
    });
  } else if (sort === "quantity") {
    jobs.sort((a, b) => {
      const diff = a.quantity - b.quantity;
      return order === "desc" ? -diff : diff;
    });
  }

  return NextResponse.json(jobs);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    const index = jobsStore.findIndex((j) => j.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (status) {
      jobsStore[index] = { ...jobsStore[index], status };
    }
    if (typeof notes === "string") {
      jobsStore[index] = { ...jobsStore[index], notes };
    }

    return NextResponse.json(jobsStore[index]);
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
