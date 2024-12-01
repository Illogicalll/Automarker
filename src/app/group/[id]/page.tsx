"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/components/context/user-context";

export default function GroupPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { user, name } = useUserContext();
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      const { data, error } = await supabase
        .from("groups")
        .select()
        .eq("id", params.id);
      if (error) {
        console.error("Error fetching assignment:", error);
      } else {
        setGroup(data[0]);
      }
    };

    fetchGroup();
  });

  return (
    <div className="w-full h-[95vh] flex flex-col p-6 gap-5">{group?.name}</div>
  );
}
