"use client";

import SparklesText from "@/components/ui/sparkles-text";
import { useUserContext } from "@/components/context/user-context";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function ProtectedPage() {
  const { user, name } = useUserContext();

  return (
    <div className="flex flex-col w-full h-full text-center gap-[100px]">
      {user && name ? (
        <>
          <h1 className="text-center text-8xl">
            Welcome back,
            <SparklesText
              className="block lg:inline text-8xl font-bold"
              text={`${name ? name : ""}!`}
            />
          </h1>
        </>
      ) : (
        <div className="flex justify-center align-center">
          <LoadingSpinner size={40} />
        </div>
      )}
    </div>
  );
}
