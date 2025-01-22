"use client";

import { signOutAction } from "@/app/actions";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { HomeIcon, ClipboardIcon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useUserContext } from "./context/user-context";
import { Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LoadingSpinner } from "./ui/spinner";
import Image from 'next/image';

export function SideBar() {
  const { user, name } = useUserContext();

  return (
    <nav className="sidebar w-[110px] flex justify-center border rounded-xl border-b-foreground/10 h-[95vh]">
      <div className="w-full flex flex-col justify-between items-center p-3 px-5 text-sm">
        <div className="flex flex-col gap-5 items-center font-semibold">
          <Image src={'/logo.png'} alt="logo" width="55" height="55" className="dark:invert pt-1" />
        </div>
        <div className="flex flex-col w-full gap-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Link href="/">
                    <Button
                      variant={"outline"}
                      className="w-full flex items-center justify-center px-6 py-7 gap-4 border rounded-xl border-b-foreground/10"
                    >
                      <HomeIcon />
                    </Button>
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Home
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Link href="/assignments">
                    <Button
                      variant={"outline"}
                      className="w-full flex flex-row items-center px-6 py-7 gap-4 border rounded-xl border-b-foreground/10"
                    >
                      <ClipboardIcon />
                    </Button>
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Assignments
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Link href="/groups">
                    <Button
                      variant={"outline"}
                      className="w-full flex flex-row items-center px-6 py-7 gap-4 border rounded-xl border-b-foreground/10"
                    >
                      <Users size={16} />
                    </Button>
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Groups
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Link href="/profile">
                    <Button
                      variant={"outline"}
                      className="w-full flex flex-row items-center px-6 py-7 gap-4 border rounded-xl border-b-foreground/10"
                    >
                      <PersonIcon />
                    </Button>
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Profile
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col w-full justify-between items-center pt-10">
          {user ? (
            <div className="flex flex-col items-center gap-4">
            {name ? (
              <>
                <div className="flex flex-col text-center gap-1 overflow-hidden">
                  <p>
                    Hey,
                  </p>
                  <p>
                    <strong>{name}</strong>
                  </p>                
                </div>
                <form action={signOutAction}>
                  <Button type="submit" variant={"outline"}>
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <LoadingSpinner />
            )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild size="sm" variant={"outline"}>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant={"default"}>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}

          <div className="flex flex-col w-full justify-between items-center mt-6 text-center">
            <p>
              ©&nbsp;
            </p>
            <p>
              <a
                href="https://w-murphy.com"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
              >
                Will Murphy
              </a>
            </p>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}