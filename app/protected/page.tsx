import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SparklesText from "@/components/ui/sparkles-text";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex flex-col w-full h-full text-center gap-[100px]">
      <h1 className="text-center text-8xl">
        Welcome back,
        <SparklesText
          className="inline text-8xl font-bold"
          text={`${user?.user_metadata.full_name}!`}
        />
      </h1>
    </div>
  );
}
