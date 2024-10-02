import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function Workflow() {
  return (
    <div className="w-full flex justify-between items-center pl-8 pr-8">
      <div className="flex flex-col gap-4 border border-b-foreground/10 max-w-[300px] rounded-md p-10">
        <h1 className="font-bold text-2xl">Create</h1>
        <p>
          Create assignments in a language of your choice and invite students to
          participate
        </p>
      </div>
      <ArrowRightIcon width={50} height={50} />
      <div className="flex flex-col gap-4 border border-b-foreground/10 max-w-[300px] rounded-md p-10">
        <h1 className="font-bold text-2xl">Complete</h1>
        <p>Finish the assignment and upload a solution to be marked...</p>
      </div>
      <ArrowRightIcon width={50} height={50} />
      <div className="flex flex-col gap-4 border border-b-foreground/10 max-w-[300px] rounded-md p-10">
        <h1 className="font-bold text-2xl">Compete</h1>
        <p>Optimise your work to fight for the top spot on the leaderboard!</p>
      </div>
    </div>
  );
}
