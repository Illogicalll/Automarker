"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Mail, ALargeSmall } from "lucide-react";
import ShinyButton from "@/components/ui/shiny-button";
import { useUserContext } from "./context/user-context";

export default function AccountForm() {
  const { user, name, checkUser } = useUserContext();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fullname, setFullname] = useState(name);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  async function updateProfile({
    avatar_url,
  }: {
    fullname: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      alert("Error updating the data!");
    } finally {
      checkUser();
      setLoading(false);
    }
  }

  useEffect(() => {
    setFullname(name);
  }, [name]);

  return (
    <div className="flex flex-col justify-start items-start w-full h-full p-10 gap-10">
      <h1 className="text-8xl font-bold text-center w-full">My Profile</h1>
      <div className="flex flex-col w-full justify-center items-center gap-5">
        {fullname && (
          <div className="flex flex-col gap-5 justify-center items-center">
            <div className="flex h-[25px] gap-2 items-center">
              <label htmlFor="email">
                <Mail className="inline" size={25} />
              </label>
              <p className="inline border border-x-0 border-t-0 border-b-gray-500 text-gray-500">
                {user.email}
              </p>
              <input
                className="hidden"
                id="email"
                type="text"
                value={user.email}
                disabled
              />
            </div>
            <div className="flex h-[25px] gap-2 items-center">
              <label htmlFor="fullName">
                <ALargeSmall className="inline" size={25} />
              </label>
              <input
                id="fullName"
                type="text"
                value={fullname}
                className="bg-transparent outline-0 w-full border border-x-0 border-t-0 border-b-sky-500"
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div onClick={() => updateProfile({ fullname, avatar_url })}>
              <ShinyButton
                className={`cursor-${loading ? "default" : "pointer"}`}
              >
                {loading ? "Loading ..." : "Update"}
              </ShinyButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
