"use client";

import SparklesText from "@/components/ui/sparkles-text";
import { useUserContext } from "@/components/context/user-context";

export default function ProtectedPage() {
  const { user, name } = useUserContext();

  return (
    <div className="flex flex-col w-full h-full text-center gap-[100px]">
      <h1 className="text-center text-8xl">
        Welcome back,
        <SparklesText
          className="inline text-8xl font-bold"
          text={`${name ? name : ""}!`}
        />
      </h1>
    </div>
  );
}
