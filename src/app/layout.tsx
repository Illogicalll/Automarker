"use client";

import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { SideBar } from "@/components/sidebar";
import ShineBorder from "@/components/ui/shine-border";
import "./globals.css";
import DockNav from "@/components/dock-nav";
import { UserProvider } from "@/components/context/user-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

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
