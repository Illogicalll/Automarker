"use client";

import { signOutAction } from "@/app/actions";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { HomeIcon, ClipboardIcon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useUserContext } from "./context/user-context";

export function SideBar() {
  const { user, name } = useUserContext();

  return (
    <nav className="sidebar w-[350px] flex justify-center border rounded-xl border-b-foreground/10 h-[95vh]">
      <div className="w-full flex flex-col justify-between items-center p-3 px-5 text-sm">
        <div className="flex flex-col gap-5 items-center font-semibold">
          <h1 className="font-bold text-4xl p-10">AutoAssign</h1>
        </div>
        <div className="flex flex-col w-full gap-5">
          <Link href="/">
            <Button
              variant={"outline"}
              className="w-full flex flex-row items-center p-7 gap-4 border rounded-xl border-b-foreground/10"
            >
              <HomeIcon />
              <p>Home</p>
            </Button>
          </Link>
          <Link href="/assignments">
            <Button
              variant={"outline"}
              className="w-full flex flex-row items-center p-7 gap-4 border rounded-xl border-b-foreground/10"
            >
              <ClipboardIcon />
              <p>My Asssignments</p>
            </Button>
          </Link>
          <Link href="/profile">
            <Button
              variant={"outline"}
              className="w-full flex flex-row items-center p-7 gap-4 border rounded-xl border-b-foreground/10"
            >
              <PersonIcon />
              <p>My Profile</p>
            </Button>
          </Link>
        </div>

        <div className="flex flex-col w-full justify-between items-center pt-10">
          {user ? (
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
          )}

          <div className="flex w-full justify-between items-center mt-6 flex-row h-[30px]">
            <p>
              ©&nbsp;
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
