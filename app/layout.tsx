"use client";

import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { SideBar } from "@/components/sidebar";
import ShineBorder from "@/components/ui/shine-border";
import "./globals.css";
import { useEffect, useState } from "react";
import DockNav from "@/components/dock-nav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [width, setWindowWidth] = useState(0);
  const [height, setWindowHeight] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="h-screen w-screen fixed top-0 left-0 flex items-center">
            <div
              className="flex-1 w-full flex items-center justify-center"
              style={{
                flexDirection: width < 1171 ? "column" : "row",
                gap: width < 1171 ? "0px" : "50px",
                padding: width < 1171 ? "15px" : "40px",
              }}
            >
              <SideBar />
              <ShineBorder
                className={`h-[${width < 1171 ? "90vh" : "95vh"}] w-full overflow-hidden rounded-xl p-3 mb-[${height > 1100 ? "14px" : "0px"}]`}
                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                borderWidth={3}
                borderRadius={12}
              >
                <div className="w-full h-full z-10 overflow-y-scroll">
                  {children}
                </div>
              </ShineBorder>
              {width < 1171 ? <DockNav /> : ""}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
