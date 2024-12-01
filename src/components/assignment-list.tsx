"use client";

import Assignment from "./assignment";
import { Skeleton } from "./ui/skeleton";
import CreateAssignment from "./create-assignment";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MagicCard } from "./ui/magic-card";

export default function AssignmentList({
  assignments,
  isMyAssignments,
}: {
  assignments: any;
  isMyAssignments: boolean;
}) {
  const { theme } = useTheme();

  return (
    <div className="w-full flex gap-6 p-6 overflow-x-scroll overflow-y-hidden">
      {assignments === 1 ? (
        isMyAssignments ? (
          <CreateAssignment />
        ) : (
          <MagicCard
            className="min-w-[300px] max-w-[300px] max-h-full h-[200px] opacity-80 rounded-lg flex justify-center items-center border-dashed border-[3px] border-b-foreground/10 p-5"
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          >
            <p>Great News! No Assignments!</p>
          </MagicCard>
        )
      ) : assignments ? (
        <>
          {isMyAssignments ? (
            <div>
              <CreateAssignment />
            </div>
          ) : (
            ""
          )}
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
