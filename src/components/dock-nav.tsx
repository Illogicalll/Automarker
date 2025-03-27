import React from "react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "../lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { HomeIcon, ClipboardIcon, PersonIcon } from "@radix-ui/react-icons";
import { signOutAction } from "@/app/actions";
import { LogOut, UserPlus, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Dock, DockIcon } from "./ui/dock";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Users } from "lucide-react";

export type IconProps = React.HTMLAttributes<SVGElement>;

export default function DockNav() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  }

  useEffect(() => {
    checkUser();
  }, []);

  const {} = supabase.auth.onAuthStateChange(() => {
    checkUser();
  });

  return (
    <TooltipProvider>
      <Dock direction="middle">
        <DockIcon>
          {/* <Tooltip> */}
          {/*   <TooltipTrigger asChild> */}
          <Link
            href={"/"}
            aria-label={"Home"}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-12 rounded-full",
            )}
          >
            <HomeIcon />
          </Link>
          {/*   </TooltipTrigger> */}
          {/*   <TooltipContent> */}
          {/*     <p>Home</p> */}
          {/*   </TooltipContent> */}
          {/* </Tooltip> */}
        </DockIcon>
        <DockIcon>
          {/* <Tooltip> */}
          {/*   <TooltipTrigger asChild> */}
          <Link
            href={"/assignments"}
            aria-label={"My Assignments"}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-12 rounded-full",
            )}
          >
            <ClipboardIcon />
          </Link>
          {/*   </TooltipTrigger> */}
          {/*   <TooltipContent> */}
          {/*     <p>My Assignments</p> */}
          {/*   </TooltipContent> */}
          {/* </Tooltip> */}
        </DockIcon>
        <DockIcon>
          {/* <Tooltip> */}
          {/*   <TooltipTrigger asChild> */}
          <Link
            href={"/groups"}
            aria-label={"My Groups"}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-12 rounded-full",
            )}
          >
            <Users size={16} strokeWidth={1.5} />
          </Link>
          {/*   </TooltipTrigger> */}
          {/*   <TooltipContent> */}
          {/*     <p>My Profile</p> */}
          {/*   </TooltipContent> */}
          {/* </Tooltip> */}
        </DockIcon>

        <DockIcon>
          {/* <Tooltip> */}
          {/*   <TooltipTrigger asChild> */}
          <Link
            href={"/profile"}
            aria-label={"My Profile"}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-12 rounded-full",
            )}
          >
            <PersonIcon />
          </Link>
          {/*   </TooltipTrigger> */}
          {/*   <TooltipContent> */}
          {/*     <p>My Profile</p> */}
          {/*   </TooltipContent> */}
          {/* </Tooltip> */}
        </DockIcon>
        <Separator orientation="vertical" className="h-full py-2" />
        {user ? (
          ""
        ) : (
          <DockIcon>
            {/* <Tooltip> */}
            {/*   <TooltipTrigger asChild> */}
            <form action={signOutAction}>
              <Link
                href={"/sign-in"}
                aria-label={"Sign In"}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-12 rounded-full",
                )}
              >
                <LogIn strokeWidth={1.1} size={16} />
              </Link>
            </form>
            {/*   </TooltipTrigger> */}
            {/*   <TooltipContent> */}
            {/*     <p>Log In</p> */}
            {/*   </TooltipContent> */}
            {/* </Tooltip> */}
          </DockIcon>
        )}

        {!user ? (
          <DockIcon>
            {/* <Tooltip> */}
            {/*   <TooltipTrigger asChild> */}
            <form action={signOutAction}>
              <Link
                href={"/sign-up"}
                aria-label={"Sign Up"}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-12 rounded-full",
                )}
              >
                <UserPlus strokeWidth={1.1} size={16} />
              </Link>
            </form>
            {/*   </TooltipTrigger> */}
            {/*   <TooltipContent> */}
            {/*     <p>Sign Up</p> */}
            {/*   </TooltipContent> */}
            {/* </Tooltip> */}
          </DockIcon>
        ) : (
          <DockIcon>
            {/* <Tooltip> */}
            {/*   <TooltipTrigger asChild> */}
            <form action={signOutAction}>
              <Button
                type="submit"
                variant={"outline"}
                className="border border-none rounded-full size-12"
              >
                <LogOut strokeWidth={1.1} size={16} />
              </Button>
            </form>
            {/*   </TooltipTrigger> */}
            {/*   <TooltipContent> */}
            {/*     <p>Sign Out</p> */}
            {/*   </TooltipContent> */}
            {/* </Tooltip> */}
          </DockIcon>
        )}
        <DockIcon>
          {/* <Tooltip> */}
          {/*   <TooltipTrigger> */}
          <ThemeSwitcher />
          {/*   </TooltipTrigger> */}
          {/*   <TooltipContent> */}
          {/*     <p>Theme</p> */}
          {/*   </TooltipContent> */}
          {/* </Tooltip> */}
        </DockIcon>
      </Dock>
    </TooltipProvider>
  );
}
