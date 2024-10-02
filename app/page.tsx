import Languages from "@/components/languages";
import Workflow from "@/components/workflow";

export default async function Index() {
  return (
    <div className="flex flex-col w-full h-full text-center gap-[100px]">
      <h1 className="text-center text-8xl">
        The <strong>fastest</strong> way to get coding assignments done.
      </h1>
      <div className="flex flex-col gap-5">
        <Languages />
        <h1 className="text-2xl font-extralight">
          Compatible with all the popular languages
        </h1>
      </div>
      <Workflow />
    </div>
  );
}
