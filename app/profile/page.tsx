"use client";

import AccountForm from "@/components/account-form";
import { useUserContext } from "@/components/context/user-context";

export default function Account() {
  const { user, name } = useUserContext();

  return (
    <div className="h-full w-full">
      <AccountForm user={user} name={name} />
    </div>
  );
}
