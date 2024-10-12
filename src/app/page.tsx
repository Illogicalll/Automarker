import Languages from "@/components/languages";
import Workflow from "@/components/workflow";
import SparklesText from "@/components/ui/sparkles-text";

export default function Index() {
  return (
    <div className="flex flex-col w-full h-full text-center container-gap">
      <h1 className="text-center text-6xl lg:text-8xl">
        The&nbsp;
        <SparklesText className="inline text-6xl lg:text-8xl" text="fastest" />
        &nbsp;way to get coding assignments done.
      </h1>
      <div className="flex flex-col gap-5">
        <Languages />
        <h1 className="text-2xl font-extralight text-margin-bottom">
          Compatible with all the popular languages
        </h1>
      </div>
      <Workflow />
    </div>
  );
}
