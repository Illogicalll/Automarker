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
  const [archivedAssignments, setArchivedAssignments] = useState<null | any[] | number>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;
      
      const currentDate = new Date().toISOString();
      
      const { data: allMyAssignments, error: myAssignmentsError } = await supabase
        .from("assignments")
        .select()
        .eq("user_id", user.id);
      
      if (myAssignmentsError) {
        console.error("Error fetching my assignments:", myAssignmentsError);
        return;
      }
      
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select()
        .contains("users", [user.id]);
        
      if (groupError) {
        console.error("Error fetching groups:", groupError);
        return;
      }
      
      setMyGroups(groupData);
      const groupIds = groupData.map((group) => group.id);
      
      const { data: allAssignedToMe, error: assignedToMeError } = await supabase
        .from("assignments")
        .select()
        .in("assigned_to", groupIds);
        
      if (assignedToMeError) {
        console.error("Error fetching assignments assigned to me:", assignedToMeError);
        return;
      }
      
      const archived = [...(allMyAssignments || []), ...(allAssignedToMe || [])]
        .filter((assignment) => new Date(assignment.due_date) < new Date(currentDate))
        .reduce((unique, item) => {
          return unique.find((a: { id: any; }) => a.id === item.id) ? unique : [...unique, item];
        }, []);
      
      if (archived.length === 0) {
        setArchivedAssignments(1);
      } else {
        setArchivedAssignments(archived);
      }
      
      const activeMyAssignments = (allMyAssignments || [])
        .filter(assignment => new Date(assignment.due_date) >= new Date(currentDate));
        
      if (activeMyAssignments.length === 0) {
        setMyAssignments(1);
      } else {
        setMyAssignments(activeMyAssignments);
      }
      
      const activeAssignedToMe = (allAssignedToMe || [])
        .filter(assignment => new Date(assignment.due_date) >= new Date(currentDate));
        
      if (activeAssignedToMe.length === 0) {
        setAssignedToMe(1);
      } else {
        setAssignedToMe(activeAssignedToMe);
      }
    };
    
    fetchAssignments();
  }, [user]);

  return (
    <div className="w-full h-[95vh] flex flex-col p-6">
      <h1 className="text-6xl font-bold">My Assignments</h1>
      <AssignmentList assignments={myAssignments} isMyAssignments={true} />
      <h1 className="text-6xl font-bold">Assigned to Me</h1>
      <AssignmentList assignments={assignedToMe} isMyAssignments={false} />
      <h1 className="text-6xl font-bold">Archive</h1>
      <AssignmentList assignments={archivedAssignments} isMyAssignments={false} />
    </div>
  );
}
