"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { File, Folder, Tree } from "@/components/ui/file-tree";
import CodeComparison from "@/components/ui/code-comparison";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Badge } from "@/components/ui/badge";

interface FileNode {
  id: string;
  isSelectable: boolean;
  name: string;
}

interface FolderNode extends FileNode {
  children: FileNode[];
}

export default function SubmissionPage({
  params,
}: {
  params: { assignment_id: string; user_id: string };
}) {
  const supabase = createClient();
  const [fileTree, setFileTree] = useState<FolderNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [progress, setProgress] = useState<number>(0);
  const [username, setUsername] = useState<string | null>(null);
  const [assignmentName, setAssignmentName] = useState<string | null>(null);
  const [assignmentLanguage, setAssignmentLanguage] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<any | undefined>(undefined);
  const [submissionZip, setSubmissionZip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(undefined);
  const [scores, setScores] = useState<any>(undefined);
  
  const downloadCode = async () => {
    setProgress(60);
    const { data, error } = await supabase.storage
      .from("submissions")
      .download(params.assignment_id + "/" + params.user_id);
  
    if (error) {
      console.error("Error downloading file:", error);
      return;
    }
    setSubmissionZip(data);
  
    setProgress(80);
    const zip = await JSZip.loadAsync(data);
    const fileTreeStructure: FolderNode[] = [];
  
    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.includes("__MACOSX") || relativePath.split('/')[relativePath.split('/').length - 1].startsWith('.') || relativePath.split('.').length > 2) {
        return;
      }
  
      if (!zipEntry.dir) {
        const parts = relativePath.split("/");
  
        let currentFolder: (FileNode | FolderNode)[] = fileTreeStructure;
  
        parts.forEach((part, index) => {
          if (index === parts.length - 1) {
            currentFolder.push({
              id: relativePath,
              isSelectable: true,
              name: part,
            });
          } else {
            let folder = currentFolder.find((el) => el.name === part);
            if (!folder) {
              folder = {
                id: `${relativePath}-${index}`,
                isSelectable: true,
                name: part,
                children: [],
              } as FolderNode;
  
              currentFolder.push(folder);
            }
  
            currentFolder = (folder as FolderNode).children;
          }
        });
      }
    });
  
    setProgress(95);
    setFileTree(fileTreeStructure);
  };
  
  const handleFileSelection = async (file: FileNode) => {
    setSelectedFile(file);
    if (!fileContents[file.id]) {
      const { data, error } = await supabase.storage
        .from("submissions")
        .download(params.assignment_id + "/" + params.user_id);

      if (error) {
        console.error("Error downloading file:", error);
        return;
      }

      const zip = await JSZip.loadAsync(data);
      const zipEntry = zip.file(file.id);
      if (zipEntry) {
        const content = await zipEntry.async("text");
        setFileContents(prev => ({ ...prev, [file.id]: content }));
      }
    }
  };

  const getDetails = async () => {
    const { data: username, error: usernameError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", params.user_id);
      if (username) {
        setUsername(username[0].full_name);
      }
    const { data: assignmentName, error: assignmentError } = await supabase
      .from("assignments")
      .select("title")
      .eq("id", params.assignment_id);
      if (assignmentName) {
        setAssignmentName(assignmentName[0].title)
      }
      const { data: assignmentLanguage, error: assignmentLError } = await supabase
      .from("assignments")
      .select("language")
      .eq("id", params.assignment_id);
      if (assignmentLanguage) {
        setAssignmentLanguage(assignmentLanguage[0].language)
      }
    const { data: scores, error: scoresError } = await supabase
      .from("submissions")
      .select("tests_run, tests_passed, tests_failed")
      .eq("assignment_id", params.assignment_id)
      .eq("user_id", params.user_id);
      if (scores) {
        setScores(scores[0])
      }
  }

  const updateScore = async (scores: any) => {
    const {data, error} = await supabase
      .from("submissions")
      .upsert([{
        assignment_id: params.assignment_id,
        user_id: params.user_id,
        tests_run: scores.run,
        tests_passed: scores.passed,
        tests_failed: scores.failed,
    }])
  }

  function exploreTree(folder: FolderNode, handleFileSelection: (file: FileNode) => void) {
    return folder.children?.map((child: FileNode) => {
      if (child.hasOwnProperty('children') && (child as FolderNode).children) {
        return (
          <Folder key={child.id} value={child.id} element={child.name}>
            {exploreTree(child as FolderNode, handleFileSelection)}
          </Folder>
        );
      } else {
        return (
          <File key={child.id} value={child.id} onClick={() => handleFileSelection(child)}>
            <p>{child.name}</p>
          </File>
        );
      }
    });
  }

  useEffect(() => {
    downloadCode();
    getDetails();
  }, [params]);

  return (
    <>
    {fileTree.length !== 0 && username && assignmentName ? (
        <div className="w-full h-[95vh] flex flex-col p-6 gap-5">
          <h1 className="text-4xl font-bold">{username}'s submission for {assignmentName}</h1>
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Testing</AccordionTrigger>
              <AccordionContent className={isLoading ? "blur-sm rounded-sm transition-all cursor-default" : "transition-all"}>
                <div className="w-full pb-5">
                  <CodeComparison
                    beforeCode={testOutput ? testOutput : scores ? "Test output is not stored, only the results. Re-run the tests to see the output" : "Tests have not been run yet. Click the button below to see test output here."}
                    afterCode={""}
                    language={"text"}
                    filename={"Test Results"}
                    lightTheme="github-light"
                    darkTheme="github-dark"
                  />
                </div>
                <div className="flex gap-4 items-center">
                <InteractiveHoverButton
                  className={isLoading ? "cursor-default" : ""}
                  disabled={isLoading}
                  onClick={async () => {
                    if (!submissionZip || !params.assignment_id) {
                      console.error("Submission zip or assignment ID is missing.");
                      return;
                    }
                    setIsLoading(true);
                    try {
                      const formData = new FormData();
                      formData.append("submissionZip", submissionZip);
                      formData.append("assignment_id", params.assignment_id);

                      const response = await fetch(`/api/execute-${assignmentLanguage}`, {
                        method: "POST",
                        body: formData,
                      });

                      if (!response.ok) {
                        console.error("Failed to execute tests:", response.statusText);
                        return;
                      }

                      const result = await response.json();
                      setResults(result.results);
                      updateScore(result.results);
                      setTestOutput(result.output || "No test output returned.");
                    } catch (error) {
                      console.error("Error executing tests:", error);
                    }
                    setIsLoading(false);
                  }}
                >
                  {isLoading ? "Running Tests" : "Run Tests"}
                </InteractiveHoverButton>
                {results || scores ? (
                  <>
                    <Badge className="h-[25px]" >Run: {scores ? scores.tests_run : results.run}</Badge>
                    <Badge className="bg-green-400 h-[25px] hover:bg-green-300">Passed: {scores ? scores.tests_passed : results.passed}</Badge>
                    <Badge className="bg-red-600 h-[25px] text-white hover:bg-red-500">Failed: {scores ? scores.tests_failed : results.failed}</Badge>
                  </>
                ) : ""}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" >
              <AccordionTrigger>Code</AccordionTrigger>
              <AccordionContent>
                <div className="pb-5 flex flex-col">
                  <Tree className="overflow-hidden rounded-md bg-background p-2">
                    {fileTree.map((folder: FolderNode) => (
                      <Folder key={folder.id} element={folder.name} value={folder.id}>
                        {exploreTree(folder, handleFileSelection)}
                      </Folder>
                    ))}
                  </Tree>
                  <CodeComparison
                    beforeCode={
                      selectedFile ? (fileContents[selectedFile.id] || "Loading...") : "No file selected"
                    }
                    afterCode={""}
                    language={!selectedFile ? "text" : selectedFile.name.split('.')[1] === "h" ? "c" : selectedFile.name.split('.')[1]}
                    filename={selectedFile ? selectedFile.name : "No file selected"}
                    lightTheme="github-light"
                    darkTheme="github-dark"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
    ) : 
    (
      <div className="w-full h-[95vh] flex flex-col p-6 gap-5 justify-center items-center">
        <h1>Loading Submission...</h1>
        <div className="w-[150px]">
          <Progress value={progress} />
        </div>
      </div>
    )
    }
  </>
  );
}
