import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { SideBar } from "@/components/sidebar";
import ShineBorder from "@/components/ui/shine-border";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-row gap-20 items-center justify-center p-10">
              <SideBar />
              <ShineBorder
                className="h-[95vh] w-full overflow-hidden rounded-xl p-3"
                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                borderWidth={3}
                borderRadius={12}
              >
                <div className="w-full h-full z-10 overflow-y-scroll">
                  {children}
                </div>
              </ShineBorder>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
