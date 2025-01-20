"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { File, Folder, Tree } from "@/components/ui/file-tree";
import CodeComparison from "@/components/ui/code-comparison";
import { Progress } from "@/components/ui/progress"

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
  
  const downloadCode = async () => {
    setProgress(60);
    const { data, error } = await supabase.storage
      .from("submissions")
      .download(params.assignment_id + "/" + params.user_id);

    if (error) {
      console.error("Error downloading file:", error);
      return;
    }
    
    setProgress(80);
    const zip = await JSZip.loadAsync(data);
    const fileTreeStructure: FolderNode[] = [];

    const rootFolder: FolderNode = {
      id: "src",
      isSelectable: false,
      name: "src",
      children: [],
    };

    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.includes("__MACOSX")) {
        return;
      }

      if (!zipEntry.dir) {
        const parts = relativePath.split("/");

        let currentFolder: (FileNode | FolderNode)[] = rootFolder.children;

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
                isSelectable: false,
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
    fileTreeStructure.push(rootFolder);
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
          <div className="pb-5 flex">
            <Tree
              className="overflow-hidden rounded-md bg-background p-2 w-[20%]"
              initialSelectedId="7"
              initialExpandedItems={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]}
              elements={fileTree}
            >
              {fileTree.map((folder: FolderNode) => (
                <Folder key={folder.id} element={folder.name} value={folder.id}>
                  {folder.children?.map((child: FileNode) => (
                    child.hasOwnProperty("children") ? (
                      <Folder key={child.id} value={child.id} element={child.name}>
                        {(child as FolderNode).children.map((file: FileNode) => (
                          <File key={file.id} value={file.id} onClick={() => handleFileSelection(file)}>
                            <p>{file.name}</p>
                          </File>
                        ))}
                      </Folder>
                    ) : (
                      <File key={child.id} value={child.id} onClick={() => handleFileSelection(child)}>
                        <p>{child.name}</p>
                      </File>
                    )
                  ))}
                </Folder>
              ))}
            </Tree>
            <div className="w-[80%]">
                <CodeComparison
                  beforeCode={
                    selectedFile ? (fileContents[selectedFile.id] || "Loading...") : "No file selected"
                  }
                  afterCode={""}
                  language={selectedFile ? selectedFile.name.split('.')[1] : "text"}
                  filename={selectedFile ? selectedFile.name : "No file selected"}
                  lightTheme="github-light"
                  darkTheme="github-dark"
                />
            </div>
          </div>
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
