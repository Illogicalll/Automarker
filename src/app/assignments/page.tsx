"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/components/context/user-context";
import AssignmentList from "@/components/assignment-list";

export default function AssignmentsPage() {
  const supabase = createClient();
  const { user, name } = useUserContext();
  const [assignments, setAssignments] = useState<null | any[] | number>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (user && !assignments) {
        const { data, error } = await supabase
          .from("assignments")
          .select()
          .eq("user_id", user.id);
        if (error) {
          console.error("Error fetching assignments:", error);
        } else {
          if (data.length === 0) {
            setAssignments(1);
          } else {
            setAssignments(data);
          }
        }
      }
    };

    fetchAssignments();
  }, [user]);

  return (
    <div className="w-full h-[95vh] flex flex-col p-6">
      <h1 className="text-6xl font-bold">My Assignments</h1>
      <AssignmentList assignments={assignments} />
      <h1 className="text-6xl font-bold">Assigned to Me</h1>
      {/* <AssignmentList assignments={""} /> */}
      <h1 className="text-6xl font-bold">Archive</h1>
      {/* <AssignmentList assignments={""} /> */}
    </div>
  );
}
