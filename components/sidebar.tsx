import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { HomeIcon, ClipboardIcon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";

export function SideBar() {
  return (
    <nav className="w-[350px] flex justify-center border rounded-xl border-b-foreground/10 h-[95vh]">
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
          {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
          <div className="flex w-full justify-between items-center mt-6 flex-row">
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
