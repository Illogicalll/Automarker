import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <div className="w-full h-[95vh] flex flex-col justify-center items-center text-center">
      <Image src={'/logo.png'} alt="logo" width="55" height="55" className="dark:invert pt-1" />
      <h1 className="text-6xl font-bold">Reset Password</h1>
      <form className="flex flex-col w-[60%] max-w-[400px]">
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label className="text-left" htmlFor="email">
            Email
          </Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reset Password
          </SubmitButton>
          <p className="text-sm text-secondary-foreground mt-2">
            Already have an account?&nbsp;
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
