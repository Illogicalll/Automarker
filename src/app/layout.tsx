"use client";

import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { SideBar } from "@/components/sidebar";
import ShineBorder from "@/components/ui/shine-border";
import "./globals.css";
import { useEffect, useState } from "react";
import DockNav from "@/components/dock-nav";
import { createClient } from "@/utils/supabase/client";
import { UserProvider } from "@/components/context/user-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [user, setUser] = useState<User | null>(null);
  // const [name, setName] = useState<string | null>(null);
  // const supabase = createClient();
  //
  // async function checkUser() {
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();
  //   if (user) {
  //     setUser(user);
  //     const { data } = await supabase
  //       .from("profiles")
  //       .select(`full_name`)
  //       .eq("id", user?.id)
  //       .single();
  //     setName(data?.full_name);
  //   } else {
  //     setUser(null);
  //   }
  // }
  //
  // useEffect(() => {
  //   const {} = supabase.auth.onAuthStateChange((event) => {
  //     if (event === "SIGNED_IN" || event === "USER_UPDATED") {
  //       checkUser();
  //     }
  //   });
  // }, []);

  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <UserProvider>
        <body className="bg-background text-foreground overflow-hidden">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="h-screen w-screen fixed top-0 left-0 flex items-center">
              <div className="main-container">
                <SideBar />
                <div className="content-container">
                  <ShineBorder
                    className="shine-border-container"
                    color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                    borderWidth={3}
                    borderRadius={12}
                  >
                    <div className="content-wrapper">{children}</div>
                  </ShineBorder>
                </div>
                <div className="dock-nav">
                  <DockNav />
                </div>
              </div>
            </main>
          </ThemeProvider>
        </body>
      </UserProvider>
    </html>
  );
}
