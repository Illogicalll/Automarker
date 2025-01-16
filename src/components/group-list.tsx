"use client";

import CreateGroup from "./create-group";
import Group from "./group";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

export default function GroupList({ groups }: { groups: any }) {
  return (
    <div className="w-full flex gap-6 p-6 overflow-x-scroll overflow-y-hidden">
      {groups === 1 ? (
        <CreateGroup />
      ) : groups ? (
        <>
          <div>
            <CreateGroup />
          </div>
          {groups.map((group: any) => (
            <Link key={group.id} href={`/group/${group.id}`}>
              <Group name={group.name} />
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
