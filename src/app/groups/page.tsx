"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/components/context/user-context";
import GroupList from "@/components/group-list";

export default function Groups() {
  const supabase = createClient();
  const { user, name } = useUserContext();
  const [groups, setGroups] = useState<null | any[] | number>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (user && !groups) {
        const { data, error } = await supabase
          .from("groups")
          .select()
          .eq("owner", user.id);
        if (error) {
          console.error("Error fetching groups:", error);
        } else {
          if (data.length === 0) {
            setGroups(1);
          } else {
            setGroups(data);
          }
        }
      }
    };

    fetchGroups();
  }, [user]);

  return (
    <div className="w-full h-[95vh] flex flex-col p-6">
      <h1 className="text-6xl font-bold">My Groups</h1>
      <GroupList groups={groups} />
    </div>
  );
}
