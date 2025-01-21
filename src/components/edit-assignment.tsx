import page from "@/app/page";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useEffect, useState } from "react";
import { useUserContext } from "./context/user-context";
import { createClient } from "@/utils/supabase/client";

interface EditAssignmentProps {
  params: { id: string };
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  groups: any;
  existingProblemStatement: any,
  setup: boolean;
  isEditing: boolean;
}

export default function EditAssignment({ params, isOpen, setIsOpen, groups, existingProblemStatement, setup, isEditing }: EditAssignmentProps) {
  const [assignees, setAssignees] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, name } = useUserContext();
  const supabase = createClient();
  const [problemStatement, setProblemStatement] = useState(existingProblemStatement);
  const [modelSolution, setModelSolution] = useState<any>(null);
  const [skeletonCode, setSkeletonCode] = useState<any>(null);
  const [isZip, setIsZip] = useState(false);

  useEffect(() => {
    if (existingProblemStatement !== null && existingProblemStatement !== undefined) {
      setProblemStatement(existingProblemStatement);
    }
  }, [existingProblemStatement]);
  
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
      setPage(2);
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
              <DialogDescription>
                {isEditing ? (
                  <span>
                    Fill out the fields below. What you dont touch won't be
                    changed, even if it appears empty
                  </span>
                ) : (
                  <span>Fill out the fields below</span>
                )}
              </DialogDescription>
            </DialogHeader>
            {page === 1 ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Choose a group to set this assignment for:</Label>
                  <Select
                    onValueChange={(value) => setAssignees(value)}
                    defaultValue={"select a group"}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem disabled value="select a group">
                        <div className="flex items-center gap-2">
                          Select a Group
                        </div>
                      </SelectItem>
                      {groups
                        ? groups.map((group: any) => (
                            <SelectItem
                              key={group.id}
                              value={group.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                {group.name}
                              </div>
                            </SelectItem>
                          ))
                        : ""}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 cursor-pointer">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="model_solution"
                    className="cursor-pointer font-bold"
                  >
                    Unit Tests
                  </Label>
                  <div className="inline">
                    <p className="text-sm text-muted-foreground inline-block">
                      AutoAssign will use these tests to automatically grade student submissions. For a guide on what to upload,
                    </p>
                    &nbsp;
                    <p className="text-sm text-white underline inline-block z-50 cursor-pointer hover:text-gray-400">click here</p>.
                  </div>
                  <Input
                    id="model_solution"
                    type="file"
                    accept=".py, .js, .c, .cpp, .rs, .java, .zip"
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
                    accept=".py, .js, .c, .cpp, .rs, .java, .zip"
                    className="cursor-pointer"
                    onChange={(event) => {
                      const file = event.target.files && event.target.files[0];
                      if (file) {
                        setSkeletonCode(file);
                        setIsZip(
                          file.type === "application/zip" ||
                            file.name.endsWith(".zip"),
                        );
                      }
                    }}
                  />{" "}
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
                        : setup === false
                          ? "Complete to Continue"
                          : "Finish"}
                </Button>
              ) : isEditing ? (
                <Button
                  type="submit"
                  onClick={handleSubmit2}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Finish"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit2}
                  disabled={
                    loading ||
                    (setup === false && modelSolution === null ) ||
                    problemStatement === null ||
                    problemStatement === ""
                  }
                >
                  {loading
                    ? "Updating..."
                    : (setup === false && modelSolution === null ) ||
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
  )
}