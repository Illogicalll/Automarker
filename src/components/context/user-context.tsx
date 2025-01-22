import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserContextProps {
  user: User | null;
  name: string | null;
  checkUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  name: null,
  checkUser: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string | null>(null);
  let requestInProgress = false;
  const supabase = createClient();

  async function checkUser() {
    requestInProgress = true;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      setName(data?.full_name || null);
    } else {
      setUser(null);
      setName(null);
    }
    requestInProgress = false;
  }

  const {} = supabase.auth.onAuthStateChange((event, session) => {
    if (
      event === "SIGNED_IN" ||
      event === "SIGNED_OUT" ||
      (event === "INITIAL_SESSION" && !user && !requestInProgress)
    ) {
      checkUser();
    }
  });

  useEffect(() => {}, []);

  return (
    <UserContext.Provider value={{ user, name, checkUser }}>
      {children}
    </UserContext.Provider>
  );
};
