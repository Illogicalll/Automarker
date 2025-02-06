import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import { tmpdir } from "os";

const execAsync = promisify(exec);

async function extractZip(zip: JSZip, targetDir: string): Promise<void> {
  const files: any = [];
  zip.forEach((relativePath, file) => {
    if (relativePath.startsWith("__MACOSX/") || relativePath.startsWith(".")) {
      return;
    }
    if (!file.dir) {
      files.push({ path: path.join(targetDir, relativePath), content: file.async("nodebuffer") });
    } else {
      files.push({ path: path.join(targetDir, relativePath), dir: true });
    }
  });
  for (const dir of files.filter((f: { dir: any; }) => f.dir)) {
    await fs.mkdir(dir.path, { recursive: true });
  }
  await Promise.all(
    files.filter((f: { dir: any; }) => !f.dir).map(async (file: { path: any; content: any; }) => {
      await fs.mkdir(path.dirname(file.path), { recursive: true });
      const content = await file.content;
      await fs.writeFile(file.path, content);
    })
  );
}

interface TestResults {
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
}

function parseCTestOutput(output: string): TestResults {
  const runMatch = output.match(/tests\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  
  const testsRun = runMatch ? parseInt(runMatch[2], 10) : 0;
  const testsFailed = runMatch ? parseInt(runMatch[4], 10) : 0;
  const testsPassed = testsRun - testsFailed;
  
  return { testsRun, testsPassed, testsFailed };
}

async function getRootFolder(directory: string): Promise<string | null> {
  const contents = await fs.readdir(directory);
  const rootFolder = contents.find(name => !name.startsWith('.') && !name.startsWith('__'));
  return rootFolder ? rootFolder : null;
}

export async function POST(req: NextRequest) {
  const workDir = path.join(tmpdir(), uuidv4());
  const modelSolutionDir = path.join(workDir, "modelSolution");
  const submissionDir = path.join(workDir, "submission");

  let testResult = { stdout: "", stderr: "" };
  let parsedResults = { testsRun: 0, testsPassed: 0, testsFailed: 0 };

  try {
    await fs.mkdir(workDir);
    await fs.mkdir(modelSolutionDir);
    await fs.mkdir(submissionDir);

    const formData = await req.formData();
    const submissionZip = formData.get("submissionZip") as Blob;
    const assignmentId = formData.get("assignment_id");

    if (!assignmentId || !submissionZip) {
      throw new Error("Missing required fields");
    }

    const supabase = createClient();
    const { data: modelSolutionData, error: downloadError } = await supabase.storage
      .from("model_solutions")
      .download(assignmentId.toString());

    if (downloadError) {
      throw new Error(`Error downloading model solution: ${downloadError.message}`);
    }

    const modelSolutionBuffer = await modelSolutionData.arrayBuffer();
    const modelSolutionZip = await JSZip.loadAsync(modelSolutionBuffer);
    await extractZip(modelSolutionZip, modelSolutionDir);

    const submissionBuffer = await submissionZip.arrayBuffer();
    const submissionZipFile = await JSZip.loadAsync(submissionBuffer);
    await extractZip(submissionZipFile, submissionDir);

    const modelSolutionCWD = path.join(modelSolutionDir, `${await getRootFolder(modelSolutionDir)}`);
    const submissionCWD = path.join(submissionDir, `${await getRootFolder(submissionDir)}`);
    await fs.mkdir(path.join(submissionCWD, "bin"), { recursive: true });

    const modelTestPath = path.join(modelSolutionCWD, "tests");
    const submissionTestPath = path.join(submissionCWD, "tests");
    await fs.cp(modelTestPath, submissionTestPath, { recursive: true, force: true });

    const modelMakefilePath = path.join(modelSolutionCWD, "Makefile");
    const submissionMakefilePath = path.join(submissionCWD, "Makefile");
    await fs.cp(modelMakefilePath, submissionMakefilePath, { force: true });

    testResult = await execAsync("make test", { cwd: submissionCWD });
    parsedResults = parseCTestOutput(testResult.stdout + testResult.stderr);

    return NextResponse.json({
      message: "Tests completed",
      output: testResult.stdout + testResult.stderr,
      results: {
        run: parsedResults.testsRun,
        passed: parsedResults.testsPassed,
        failed: parsedResults.testsFailed,
      }
    });
  } catch (error: any) {
    if (error.cmd === "make test") {
      parsedResults = parseCTestOutput(error.message);
      return NextResponse.json({
        message: "Tests completed",
        output: error.message,
        results: {
          run: parsedResults.testsRun,
          passed: parsedResults.testsPassed,
          failed: parsedResults.testsFailed,
        }
      });
    } else {
      console.error("Error processing request:", error);
      return NextResponse.json(
        { message: "Internal Server Error", error: error.message },
        { status: 500 }
      );
    }
  } finally {
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
}
