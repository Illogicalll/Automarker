import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <div className="w-full h-[95vh] flex flex-col justify-center items-center text-center">
      <Image src={'/logo.png'} alt="logo" width="55" height="55" className="dark:invert pt-1" />
      <h1 className="text-6xl font-bold">Sign in</h1>
      <form className="flex flex-col w-[60%] max-w-[400px]">
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email" className="text-left">
            Email
          </Label>
          <Input name="email" placeholder="you@example.com" required />
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs text-foreground underline"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
          <SubmitButton pendingText="Signing In..." formAction={signInAction}>
            Sign in
          </SubmitButton>
          <p className="text-sm text-foreground mt-2">
            Don't have an account?&nbsp;
            <Link
              className="text-foreground font-medium underline"
              href="/sign-up"
            >
              Sign up
            </Link>
          </p>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
