import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserContextProps {
  user: User | null;
  name: string | null;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  name: null,
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string | null>(null);
  const supabase = createClient();

  async function checkUser() {
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
  }

  const {} = supabase.auth.onAuthStateChange((event, session) => {
    if (session || event === "SIGNED_OUT") {
      checkUser();
    }
  });

  useEffect(() => {}, []);

  return (
    <UserContext.Provider value={{ user, name }}>
      {children}
    </UserContext.Provider>
  );
};
