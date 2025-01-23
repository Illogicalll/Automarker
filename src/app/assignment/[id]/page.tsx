"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/components/context/user-context";
import { Input } from "@/components/ui/input";
import CodeComparison from "@/components/ui/code-comparison";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import { DownloadIcon } from "lucide-react";
import ShinyButton from "@/components/ui/shiny-button";
import EditAssignment from "@/components/edit-assignment";
import ViewSubmissions from "@/components/view-submissions";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [assignment, setAssignment] = useState<any>(null);
  const { user, name } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [downloadedSkeleton, setDownloadedSkeleton] = useState<any>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [rawSkeleton, setRawSkeleton] = useState<any>(null);
  const [isOwner, setIsOwner] = useState<any>(null);
  const [problemStatement, setProblemStatement] = useState<any>(null);
  const [downloadStatus, setDownloadStatus] = useState(false);
  const [isZip, setIsZip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groups, setGroups] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [assignedTo, setAssignedTo] = useState<number | null>(null);

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
        setIsSetup(data[0].setup);
        setAssignedTo(data[0].assigned_to);
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

    const fetchSubmission = async () => {
      const { data, error } = await supabase.storage
        .from("submissions")
        .download(params.id + "/" + user?.id);
      if (error) {
        // do nothing
      } else {
        setHasSubmitted(true);
      }
    };

    if (user && isOwner !== null && !isOwner && !hasSubmitted) {
      fetchSubmission();
    }

    try {
      if (user?.id === assignment.user_id) {
        setIsOwner(true);
        if (assignment.setup === false) {
          setIsOpen(true);
        }
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      // do nothing
    }
  }, [user, assignment]);

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

  const handleCodeSubmission = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCodeChange = async (event: any) => {
    const file = event.target.files && event.target.files[0];
    const filename = params.id + "/" + user?.id;
    if (file) {
      const { data, error } = await supabase.storage
        .from("submissions")
        .upload(filename, file, { upsert: true });
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-[95vh] flex flex-col p-6 gap-5">
      {assignment ? (
        <>
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
              <>
                <div
                  onClick={() => {
                    setIsEditing(true);
                    setIsOpen(true);
                  }}
                  className="h-[44px] w-[200px]"
                >
                  <ShinyButton className="h-[44px] w-[200px]">
                    <p className="mt-[3px]">Edit Assignment</p>
                  </ShinyButton>
                </div>
                <div
                onClick={() => {
                  setIsOpen2(true);
                }}
                className="h-[44px] w-[200px]"
              >
                <ShinyButton className="h-[44px] w-[200px]">
                  <p className="mt-[3px]">View Submissions</p>
                </ShinyButton>
              </div>
            </>
            ) : assignment && hasSubmitted ? (
              <ShinyButton className="h-[44px] w-[200px]">
                <p className="mt-[3px]">Submitted</p>
              </ShinyButton>
            ) : assignment && !hasSubmitted ? (
              <div onClick={handleCodeSubmission}>
                <ShinyButton className="h-[44px] w-[200px]">
                  <p className="mt-[3px]">Submit Solution</p>
                </ShinyButton>
                <Input
                  id="model_solution"
                  type="file"
                  accept=".zip"
                  className="cursor-pointer hidden"
                  ref={fileInputRef}
                  onChange={(event) => handleCodeChange(event)}
                />
              </div>
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
          <EditAssignment params={params} isOpen={isOpen} setIsOpen={setIsOpen} groups={groups} existingProblemStatement={problemStatement} setup={isSetup} isEditing={isEditing} />
          <ViewSubmissions isOpen={isOpen2} setIsOpen={setIsOpen2} params={params} assignedTo={assignedTo} />
        </>
      ) : (
        <div className="flex h-full justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      )}
    </div>
  );
}