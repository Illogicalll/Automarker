"use client";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import ShimmerButton from "@/components/ui/shimmer-button";

export default function Workflow() {
  const [width, setWindowWidth] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="w-full flex justify-center">
      <div
        className="flex justify-between items-center"
        style={{ width: width > 1960 || width < 1527 ? "70%" : "90%" }}
      >
        {width > 1526 ? (
          <div className="flex flex-col gap-4 border border-b-foreground/10 max-w-[300px] rounded-md p-10 h-[200px]">
            <h1 className="font-bold text-2xl">Create</h1>
            <p>
              Create assignments in a language of your choice and invite
              students to participate
            </p>
          </div>
        ) : (
          <ShimmerButton className="cursor-default select-none">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
              Create
            </span>
          </ShimmerButton>
        )}
        {(width > 1620 || width < 1527) && (
          <ArrowRightIcon width={50} height={50} />
        )}
        {width > 1526 ? (
          <div className="flex flex-col gap-4 border border-b-foreground/10 max-w-[300px] rounded-md p-10 h-[200px]">
            <h1 className="font-bold text-2xl">Complete</h1>
            <p>Finish the assignment and upload a solution to be marked... </p>
          </div>
        ) : (
          <ShimmerButton className="cursor-default select-none">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
              Complete
            </span>
          </ShimmerButton>
        )}
        {(width > 1620 || width < 1527) && (
          <ArrowRightIcon width={50} height={50} />
        )}
        {width > 1526 ? (
          <div className="flex flex-col gap-4 border border-b-foreground/10 max-w-[300px] rounded-md p-10 h-[200px]">
            <h1 className="font-bold text-2xl">Compete</h1>
            <p>
              Optimise your work to fight for the top spot on the leaderboard!
            </p>
          </div>
        ) : (
          <ShimmerButton className="cursor-default select-none">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
              Compete
            </span>
          </ShimmerButton>
        )}
      </div>
    </div>
  );
}
