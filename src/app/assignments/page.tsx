"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/components/context/user-context";
import AssignmentList from "@/components/assignment-list";

export default function AssignmentsPage() {
  const supabase = createClient();
  const { user, name } = useUserContext();
  const [myAssignments, setMyAssignments] = useState<null | any[] | number>(
    null,
  );
  const [myGroups, setMyGroups] = useState<null | any[]>(null);
  const [assignedToMe, setAssignedToMe] = useState<null | any[] | number>(null);

  useEffect(() => {
    const fetchMyAssignments = async () => {
      if (user && myAssignments === null) {
        const { data, error } = await supabase
          .from("assignments")
          .select()
          .eq("user_id", user.id);
        if (error) {
          console.error("Error fetching assignments:", error);
        } else {
          if (data.length === 0) {
            setMyAssignments(1);
          } else {
            setMyAssignments(data);
          }
        }
      }
    };

    const fetchAssignedToMe = async () => {
      if (user && assignedToMe === null) {
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select()
          .contains("users", [user.id]);
        if (groupError) {
          console.error("Error fetching groups:", groupError);
        } else {
          setMyGroups(groupData);
          const groupIds = groupData.map((group) => group.id);
          const { data, error } = await supabase
            .from("assignments")
            .select()
            .in("assigned_to", groupIds);
          if (error) {
            console.error("Error fetching assignments:", error);
          } else {
            if (data.length === 0) {
              setAssignedToMe(1);
            } else {
              setAssignedToMe(data);
            }
          }
        }
      }
    };

    fetchMyAssignments();
    fetchAssignedToMe();
  }, [user, myAssignments, assignedToMe]);

  return (
    <div className="w-full h-[95vh] flex flex-col p-6">
      <h1 className="text-6xl font-bold">My Assignments</h1>
      <AssignmentList assignments={myAssignments} isMyAssignments={true} />
      <h1 className="text-6xl font-bold">Assigned to Me</h1>
      <AssignmentList assignments={assignedToMe} isMyAssignments={false} />
      <h1 className="text-6xl font-bold">Archive</h1>
      {/* <AssignmentList assignments={""} /> */}
    </div>
  );
}
