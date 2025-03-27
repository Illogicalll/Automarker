"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useUserContext } from "../../../components/context/user-context";
import { Input } from "../../../components/ui/input";
import CodeComparison from "../../../components/ui/code-comparison";
import { AnimatedSubscribeButton } from "../../../components/ui/animated-subscribe-button";
import { DownloadIcon } from "lucide-react";
import ShinyButton from "../../../components/ui/shiny-button";
import EditAssignment from "../../../components/edit-assignment";
import ViewSubmissions from "../../../components/view-submissions";
import { LoadingSpinner } from "../../../components/ui/spinner";
import Leaderboard from "../../../components/leaderboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { toast } from "../../../components/ui/use-toast";

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [assignment, setAssignment] = useState<any>(null);
  const { user, name } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [confirmAssignmentName, setConfirmAssignmentName] = useState<string>("");
  const [dueDatePassed, setDueDatePassed] = useState<boolean>(false);

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
        
        // Check if due date has passed
        if (data[0].due_date) {
          const dueDate = new Date(data[0].due_date);
          const currentDate = new Date();
          setDueDatePassed(currentDate > dueDate);
        }
        
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

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("user_id, tests_run, tests_passed, tests_failed, avg_execution_time, avg_memory_usage")
        .eq("assignment_id", params.id);
      if (data) {
        const transformedData = data.map((submission: any) => ({
          user_id: submission.user_id,
          has_passed_tests: submission.tests_run === submission.tests_passed,
          avg_execution_time: submission.avg_execution_time,
          avg_memory_usage: submission.avg_memory_usage,
        }));
        setSubmissions(transformedData);
      }
    };
    fetchSubmissions();
  }, [params.id]);

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
      setLoading(true);
      
      try {
        const { data, error } = await supabase.storage
          .from("submissions")
          .upload(filename, file, { upsert: true });
          
        if (error) {
          console.error("Error uploading submission:", error);
          toast({
            title: "Error uploading submission",
            description: "Please try again later.",
            variant: "destructive",
            duration: 5000,
          });
          setLoading(false);
          return;
        }
        
        const { data: assignmentData } = await supabase
          .from("assignments")
          .select("language")
          .eq("id", params.id)
          .single();
          
        if (!assignmentData) {
          toast({
            title: "Submission uploaded",
            description: "Your code was submitted successfully, but automatic test execution failed.",
            duration: 5000,
          });
          window.location.href = `/submission/${params.id}/${user?.id}`;
          return;
        }
        
        const formData = new FormData();
        formData.append("submissionZip", file);
        formData.append("assignment_id", params.id);
        
        toast({
          title: "Submission received",
          description: "Running tests automatically... Leaving this page will terminate the process.",
          duration: 5000,
        });
        
        const response = await fetch(`/api/execute-${assignmentData.language}`, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          console.error("Failed to execute tests:", response.statusText);
          toast({
            title: "Tests failed to run",
            description: "Your submission was uploaded but tests couldn't be executed automatically.",
            variant: "destructive",
            duration: 5000,
          });
          window.location.href = `/submission/${params.id}/${user?.id}`;
          return;
        }
        
        const result = await response.json();
        
        await supabase
          .from("submissions")
          .upsert([{
            assignment_id: params.id,
            user_id: user?.id,
            tests_run: result.results.run,
            tests_passed: result.results.passed,
            tests_failed: result.results.failed,
            avg_execution_time: result.results.avgExecutionTime,
            avg_memory_usage: result.results.avgMemoryUsage,
          }]);
        
        toast({
          title: "Tests completed",
          description: `Passed: ${result.results.passed}/${result.results.run} tests`,
          duration: 5000,
        });
        
        window.location.href = `/submission/${params.id}/${user?.id}`;
        
      } catch (error) {
        console.error("Error processing submission:", error);
        toast({
          title: "Error processing submission",
          description: "Your file was uploaded but we couldn't run the tests automatically.",
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (confirmAssignmentName === assignment.title) {
      setLoading(true);
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", params.id);
      if (error) {
        console.error("Error deleting assignment:", error);
      } else {
        window.location.href = "/assignments";
      }
      setLoading(false);
    } else {
      alert("Assignment name does not match. Please type the correct assignment name to confirm.");
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
                <div
                  onClick={() => {
                    setIsDeleteOpen(true);
                  }}
                  className="h-[44px] w-[200px]"
                >
                  <ShinyButton className="h-[44px] w-[200px] bg-red-600 text-white hover:bg-red-900">
                    <p className="mt-[3px]">Delete Assignment</p>
                  </ShinyButton>
                </div>
              </>
            ) : assignment && hasSubmitted ? (
              <Link href={"/submission/" + params.id + "/" + user?.id}>
                <ShinyButton className="h-[44px] w-[200px]">
                  <p className="mt-[3px]">View Submission</p>
                </ShinyButton>
              </Link>
            ) : assignment && !hasSubmitted && !isOwner ? (
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
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Skeleton Code</AccordionTrigger>
              <AccordionContent>
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
                  <div>
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
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Leaderboard</AccordionTrigger>
              <AccordionContent>
                {isOwner || dueDatePassed ? (
                  <Leaderboard assignmentId={params.id} submissions={submissions} />
                ) : (
                  <div className="relative my-4">
                    <div className="filter blur-sm opacity-50">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Rank</th>
                            <th className="py-2 text-left">Name</th>
                            <th className="py-2 text-left">Score</th>
                            <th className="py-2 text-left">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...Array(5)].map((_, i) => (
                            <tr key={i} className="border-b">
                              <td className="py-3">{i + 1}</td>
                              <td className="py-3">Student Name</td>
                              <td className="py-3">100%</td>
                              <td className="py-3">0.5s</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Card className="p-4 w-3/4 max-w-md">
                        <CardHeader>
                          <h3 className="text-lg font-medium">Leaderboard not available yet</h3>
                        </CardHeader>
                        <CardContent>
                          <p>The leaderboard will be visible after the assignment due date:</p>
                          <p className="font-semibold mt-2">{assignment?.due_date ? new Date(assignment.due_date).toLocaleString() : 'Date not specified'}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <EditAssignment 
            params={params} 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            groups={groups} 
            existingProblemStatement={problemStatement} 
            setup={isSetup} 
            isEditing={isEditing} 
            existingDueDate={assignment?.due_date ? new Date(assignment.due_date) : undefined} 
          />
          <ViewSubmissions isOpen={isOpen2} setIsOpen={setIsOpen2} params={params} assignedTo={assignedTo} />

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger className="outline-none focus:outline-none hover:outline-none"></DialogTrigger>
            <DialogContent className="sm:max-w-[425px] flex flex-col">
              <DialogHeader>
                <DialogTitle>Delete Assignment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this assignment? This action cannot be undone.
                  Please type the assignment name to confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-6">
                <Input
                  type="text"
                  placeholder="Type assignment name to confirm"
                  value={confirmAssignmentName}
                  onChange={(e) => setConfirmAssignmentName(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  className="bg-red-600 text-white hover:bg-red-900"
                  onClick={handleDelete}
                  disabled={loading || confirmAssignmentName !== assignment.title}
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
                <Button onClick={() => setIsDeleteOpen(false)}>
                  <p>Cancel</p>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex h-full justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      )}
    </div>
  );
}