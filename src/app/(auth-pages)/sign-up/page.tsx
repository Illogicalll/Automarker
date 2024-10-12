import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Signup({ searchParams }: { searchParams: Message }) {
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="w-full h-[95vh] flex flex-col justify-center items-center text-center">
      <h1 className="text-6xl font-bold">Sign up</h1>
      <form className="flex flex-col w-[60%] max-w-[400px]">
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label className="text-left" htmlFor="name">
            Name
          </Label>
          <Input name="name" placeholder="John Doe" required />
          <Label className="text-left" htmlFor="email">
            Email
          </Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label className="text-left" htmlFor="password">
            Password
          </Label>
          <Input
            type="password"
            name="password"
            placeholder="********"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <p className="text-sm text text-foreground mt-2">
            Already have an account?&nbsp;
            <Link
              className="text-primary font-medium underline"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
