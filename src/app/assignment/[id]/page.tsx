"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/components/context/user-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CodeComparison from "@/components/ui/code-comparison";
import { Textarea } from "@/components/ui/textarea";

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [assignment, setAssignment] = useState<any>(null);
  const [assignees, setAssignees] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, name } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [modelSolution, setModelSolution] = useState<any>(null);
  const [skeletonCode, setSkeletonCode] = useState<any>(null);
  const [downloadedSkeleton, setDownloadedSkeleton] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [problemStatement, setProblemStatement] = useState<any>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage
        .from("skeleton_codes")
        .download(params.id);
      if (error) {
        // do nothing
      } else {
        const file = new File([data], "skeleton");
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const content = e.target?.result as string;
          setDownloadedSkeleton(content);
        };
        reader.readAsText(file);
      }
    };
    const fetchAssignment = async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select()
        .eq("id", params.id);
      if (error) {
        console.error("Error fetching assignment:", error);
      } else {
        setAssignment(data[0]);
        if (data[0].setup === true) {
          fetchFiles();
        }
      }
    };

    fetchAssignment();
  }, []);

  useEffect(() => {
    try {
      if (user.id === assignment.user_id) {
        setIsOwner(true);
        if (assignment.setup === false) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      // do nothing
    }
  }, [user, assignment]);

  const handleSubmit = async () => {
    if (assignees === null) {
      setPage(2);
    } else {
      if (user) {
        setLoading(true);

        const { data, error } = await supabase
          .from("assignments")
          .update([
            {
              assigned_to: assignees,
            },
          ])
          .eq("id", params.id);

        if (error) {
          console.error("Error updating assignment:", error);
        }
      } else {
        console.log("User not authenticated");
      }
      setLoading(false);
    }
  };

  const handleSubmit2 = async () => {
    if (user) {
      setLoading(true);
      const { data, error } = await supabase
        .from("assignments")
        .update([
          {
            problem: problemStatement,
            setup: true,
          },
        ])
        .eq("id", params.id);
      if (modelSolution !== null) {
        const { data, error } = await supabase.storage
          .from("model_solutions")
          .upload(params.id, modelSolution, { upsert: true });
      }
      if (skeletonCode !== null) {
        const { data, error } = await supabase.storage
          .from("skeleton_codes")
          .upload(params.id, skeletonCode, { upsert: true });
      }
      if (error) {
        console.error("Error updating assignment:", error);
      }
    } else {
      console.log("User not authenticated");
    }
    setLoading(false);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="w-full h-[95vh] flex flex-col p-6 gap-5">
      <h1 className="text-6xl font-bold">{assignment?.title}</h1>
      <p className="text-sm text-muted-foreground">{assignment?.description}</p>
      {isOwner ? <h1>Owner</h1> : <h1>Viewer</h1>}
      <p>{assignment?.problem}</p>
      {downloadedSkeleton ? (
        <CodeComparison
          beforeCode={downloadedSkeleton}
          afterCode={""}
          language={assignment?.language}
          filename="Skeleton Code"
          lightTheme="github-light"
          darkTheme="github-dark"
        />
      ) : (
        ""
      )}
      <Dialog open={isOpen}>
        <DialogTrigger className="outline-none focus:outline-none hover:outline-none"></DialogTrigger>
        <form onSubmit={handleSubmit}>
          <DialogContent
            className="sm:max-w-[825px] flex flex-col"
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle>Set Up Your Assignment</DialogTitle>
              <DialogDescription>Fill out the fields below</DialogDescription>
            </DialogHeader>
            {page === 1 ? (
              <p>groups</p>
            ) : (
              <div className="flex flex-col gap-4 cursor-pointer">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="model_solution"
                    className="cursor-pointer font-bold"
                  >
                    Model Solution
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    AutoAssign will compile and run this code and match its
                    output against submissions
                  </p>
                  <Input
                    id="model_solution"
                    type="file"
                    accept=".py, .js, .c, .cpp, .rs, .java"
                    className="cursor-pointer"
                    onChange={(event) =>
                      setModelSolution(
                        event.target.files && event.target.files[0],
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="skeleton_code"
                    className="cursor-pointer font-bold"
                  >
                    Skeleton Code (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    This will be provided to assignees to use as a structure on
                    which they will build their solution
                  </p>
                  <Input
                    id="skeleton_code"
                    type="file"
                    accept=".py, .js, .c, .cpp, .rs, .java"
                    className="cursor-pointer"
                    onChange={(event) =>
                      setSkeletonCode(
                        event.target.files && event.target.files[0],
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="problem" className="cursor-pointer font-bold">
                    Problem Statement
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Describe the task
                  </p>
                  <Textarea
                    value={problemStatement ? problemStatement : ""}
                    rows={10}
                    onChange={(e) => setProblemStatement(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              {page === 1 ? (
                <Button type="submit" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? "Updating..."
                    : assignees === null && page === 1
                      ? "Skip for Now"
                      : page === 1
                        ? "Add Assignees"
                        : modelSolution === null
                          ? "Complete to Continue"
                          : "Finish"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit2}
                  disabled={
                    loading ||
                    modelSolution === null ||
                    problemStatement === null ||
                    problemStatement === ""
                  }
                >
                  {loading
                    ? "Updating..."
                    : modelSolution === null ||
                        problemStatement === null ||
                        problemStatement === ""
                      ? "Complete to Continue"
                      : "Finish"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}
