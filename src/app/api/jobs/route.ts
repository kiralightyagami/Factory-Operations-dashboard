import { NextRequest, NextResponse } from "next/server";
import { mockJobs } from "@/lib/mock-data";
import { JobStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "dueDate";

  let jobs = [...mockJobs];

  if (search) {
    jobs = jobs.filter(
      (job) =>
        job.productName.toLowerCase().includes(search) ||
        job.customer.toLowerCase().includes(search) ||
        job.id.toLowerCase().includes(search),
    );
  }

  if (status !== "all") {
    jobs = jobs.filter((job) => job.status === (status as JobStatus));
  }

  if (sort === "dueDate") {
    jobs.sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  } else if (sort === "quantity") {
    jobs.sort((a, b) => b.quantity - a.quantity);
  }

  return NextResponse.json(jobs);
}
