import { ArrowRightIcon } from "@radix-ui/react-icons";
import ShimmerButton from "../components/ui/shimmer-button";

export default function Workflow() {
  return (
    <div className="w-full flex justify-center">
      <div className="workflow-container">
        <div className="workflow-box">
          <h1 className="font-bold text-2xl">Create</h1>
          <p>
            Create assignments in a language of your choice and invite students
            to participate
          </p>
        </div>
        <ArrowRightIcon className="arrow-icon" width={50} height={50} />
        <div className="workflow-box">
          <h1 className="font-bold text-2xl">Complete</h1>
          <p>Finish the assignment and upload a solution to be marked...</p>
        </div>
        <ArrowRightIcon className="arrow-icon" width={50} height={50} />
        <div className="workflow-box">
          <h1 className="font-bold text-2xl">Compete</h1>
          <p>
            Optimise your work to fight for the top spot on the leaderboard!
          </p>
        </div>

        <div className="shimmer-buttons">
          <ShimmerButton className="cursor-default select-none">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
              Create
            </span>
          </ShimmerButton>
          <ArrowRightIcon className="arrow-icon" width={50} height={50} />
          <ShimmerButton className="cursor-default select-none">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
              Complete
            </span>
          </ShimmerButton>
          <ArrowRightIcon className="arrow-icon" width={50} height={50} />
          <ShimmerButton className="cursor-default select-none">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
              Compete
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
