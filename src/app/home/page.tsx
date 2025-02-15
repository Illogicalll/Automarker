"use client";

import SparklesText from "@/components/ui/sparkles-text";
import { useUserContext } from "@/components/context/user-context";
import { LoadingSpinner } from "@/components/ui/spinner";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { UserPen, Users } from "lucide-react";
import { ClipboardIcon } from "@radix-ui/react-icons";

export default function ProtectedPage() {
  const { user, name } = useUserContext();

  const features = [
    {
      Icon: ClipboardIcon,
      name: "Your Assignments",
      description: "Browse new tasks and see your old results",
      href: "/assignments",
      cta: "to assignments...",
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: Users,
      name: "Your Groups",
      description: "See and manage which classes you are a part of",
      href: "/groups",
      cta: "to groups...",
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: UserPen,
      name: "Edit Your Profile",
      description: "Change your display name and anonymity settings",
      href: "/profile",
      cta: "to profile...",
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3",
    }
  ];


  return (
    <div className="flex flex-col w-full h-full text-center gap-[100px]">
      {user && name ? (
        <div className="w-full flex flex-col items-center gap-[40px] sm:py-[50px]">
          <h1 className="text-center text-8xl">
            Welcome back,
            <SparklesText
              className="block lg:inline text-8xl font-bold"
              text={`${name ? name : ""}!`}
            />
          </h1>
          <BentoGrid className="lg:grid-rows-2 grid-cols-2 w-[60%]">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
      ) : (
        <div className="flex justify-center align-center">
          <LoadingSpinner size={40} />
        </div>
      )}
    </div>
  );
}
