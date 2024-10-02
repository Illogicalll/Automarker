import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = createClient();
  const {
    data: { user },
  } = await createClient().auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select(`full_name`)
    .eq("id", user?.id)
    .single();

  let name = data?.full_name;

  return user ? (
    <div className="flex items-center gap-4">
      <p>
        Hey, <strong>{name}</strong>
      </p>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
