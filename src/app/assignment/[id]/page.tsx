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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/components/context/user-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CodeComparison from "@/components/ui/code-comparison";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import { DownloadIcon } from "lucide-react";
import ShinyButton from "@/components/ui/shiny-button";

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
  const [rawSkeleton, setRawSkeleton] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [problemStatement, setProblemStatement] = useState<any>(null);
  const [downloadStatus, setDownloadStatus] = useState(false);
  const [isZip, setIsZip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groups, setGroups] = useState<any>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage
        .from("skeleton_codes")
        .download(params.id);
      if (error) {
        // do nothing
      } else {
        if (data.type === "application/zip") {
          setIsZip(true);
        }
        setRawSkeleton(data);
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
        setProblemStatement(data[0].problem);
        if (data[0].setup === true) {
          fetchFiles();
        }
      }
    };
    fetchAssignment();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      if (user && groups === null) {
        const { data, error } = await supabase
          .from("groups")
          .select()
          .eq("owner", user.id);
        if (error) {
          console.error("Error fetching groups:", error);
        } else {
          setGroups(data);
        }
      }
    };

    fetchGroups();

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

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const handleDownload = async () => {
    setDownloadStatus(true);
    const blob = new Blob([rawSkeleton], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    let fileExtension;
    switch (assignment.language) {
      case "python":
        fileExtension = "py";
        break;
      case "rust":
        fileExtension = "rs";
        break;
      case "cpp":
        fileExtension = "cpp";
        break;
      case "c":
        fileExtension = "c";
        break;
      case "javascript":
        fileExtension = "js";
        break;
      case "java":
        fileExtension = "java";
        break;
      default:
        fileExtension = "txt";
        break;
    }
    if (isZip) {
      fileExtension = "zip";
    }
    link.download = `skeleton.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-[95vh] flex flex-col p-6 gap-5">
      <h1 className="text-6xl font-bold">{assignment?.title}</h1>
      <p className="text-sm text-muted-foreground">{assignment?.description}</p>
      <div className="flex gap-4">
        {assignment ? (
          <div onClick={handleDownload}>
            <AnimatedSubscribeButton
              buttonColor="#ffffff"
              buttonTextColor="#000000"
              subscribeStatus={downloadStatus}
              initialText={
                <span className="group inline-flex items-center">
                  <p className="transition-transform duration-300 group-hover:-translate-x-1">
                    Download Files
                  </p>
                  <DownloadIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              }
              changeText={
                <span className="group inline-flex items-center text-black">
                  Downloaded
                </span>
              }
            />{" "}
          </div>
        ) : (
          ""
        )}

        {isOwner && assignment ? (
          <div
            onClick={() => {
              setPage(1);
              setIsEditing(true);
              setIsOpen(true);
            }}
            className="h-[44px] w-[200px]"
          >
            <ShinyButton className="h-[44px] w-[200px]">
              <p className="mt-1">Edit Assignment</p>
            </ShinyButton>
          </div>
        ) : assignment ? (
          <ShinyButton>Submit Solution</ShinyButton>
        ) : (
          ""
        )}
      </div>
      <p>{assignment?.problem}</p>
      {downloadedSkeleton && !isZip ? (
        <div className="pb-5">
          <CodeComparison
            beforeCode={downloadedSkeleton}
            afterCode={""}
            language={assignment?.language}
            filename="Skeleton Code"
            lightTheme="github-light"
            darkTheme="github-dark"
          />
        </div>
      ) : downloadedSkeleton ? (
        <div className="pb-5">
          <CodeComparison
            beforeCode={
              ".zip file format not supported, please download the file to view"
            }
            afterCode={""}
            language={"text"}
            filename="Skeleton Code"
            lightTheme="github-light"
            darkTheme="github-dark"
          />
        </div>
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
                    Model Solution
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    AutoAssign will compile and run this code and match its
                    output against submissions
                  </p>
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
                        : modelSolution === null
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
