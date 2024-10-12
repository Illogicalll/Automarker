"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select()
        .eq("id", params.id);
      if (error) {
        console.error("Error fetching assignment:", error);
      } else {
        setAssignment(data[0]);
      }
    };

    fetchAssignment();
  }, []);

  return (
    <div className="w-full h-[95vh] flex flex-col p-6 gap-5">
      <h1 className="text-6xl font-bold">{assignment?.title}</h1>
      <p className="text-gray-500">{assignment?.description}</p>
    </div>
  );
}
