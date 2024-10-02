"use client";

import Languages from "@/components/languages";
import Workflow from "@/components/workflow";
import SparklesText from "@/components/ui/sparkles-text";
import { useEffect, useState } from "react";

export default function Index() {
  const [height, setWindowHeight] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="flex flex-col w-full h-full text-center"
      style={{ gap: height > 1100 ? "100px" : "10px" }}
    >
      <h1 className="text-center text-8xl">
        The <SparklesText className="inline text-8xl" text="fastest" /> way to
        get coding assignments done.
      </h1>
      <div className="flex flex-col gap-5">
        <Languages />
        <h1
          className="text-2xl font-extralight"
          style={{ marginBottom: height > 1100 ? "0px" : "20px" }}
        >
          Compatible with all the popular languages
        </h1>
      </div>
      <Workflow />
    </div>
  );
}
