"use client";

import Assignment from "./assignment";
import { Skeleton } from "./ui/skeleton";
import CreateAssignment from "./create-assignment";
import Link from "next/link";

export default function AssignmentList({ assignments }: { assignments: any }) {
  return (
    <div className="w-full flex gap-6 p-6 overflow-x-scroll overflow-y-hidden">
      {assignments === 1 ? (
        <CreateAssignment />
      ) : assignments ? (
        <>
          <div>
            <CreateAssignment />
          </div>
          {assignments.map((assignment: any) => (
            <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
              <Assignment
                title={assignment.title}
                description={assignment.description}
              />
            </Link>
          ))}
        </>
      ) : (
        <>
          <Skeleton className="min-w-[300px] max-w-[300px] max-h-full h-[200px] rounded-lg" />
          <Skeleton className="min-w-[300px] max-w-[300px] max-h-full h-[200px] rounded-lg opacity-75" />
          <Skeleton className="min-w-[300px] max-w-[300px] max-h-full h-[200px] rounded-lg opacity-50" />
          <Skeleton className="min-w-[300px] max-w-[300px] max-h-full h-[200px] rounded-lg opacity-25" />
        </>
      )}
    </div>
  );
}
