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
  failures: number;
  errors: number;
}

function parseUnittestOutput(output: string): TestResults {
  const match = output.match(/Ran (\d+) tests?/);
  const failuresMatch = output.match(/FAILED \((failures=(\d+))?/);
  const errorsMatch = output.match(/errors=(\d+)/);
  
  const testsRun = match ? parseInt(match[1], 10) : 0;
  const failures = failuresMatch ? parseInt(failuresMatch[2] || "0", 10) : 0;
  const errors = errorsMatch ? parseInt(errorsMatch[1], 10) : 0;
  
  return { testsRun, failures, errors };
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

  let testResult = {stdout: "", stderr: ""};
  let parsedResults = {testsRun: 0 , errors: 0, failures: 0};

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

    const modelSolutionCWD = path.join(modelSolutionDir, `${await getRootFolder(modelSolutionDir)}`)
    const submissionCWD = path.join(submissionDir, `${await getRootFolder(submissionDir)}`)

    const modelTestPath = path.join(modelSolutionCWD, "tests");
    const submissionTestPath = path.join(submissionCWD, "tests");
    await fs.cp(modelTestPath, submissionTestPath, { recursive: true, force: true });
    
    testResult = await execAsync("python3 -m unittest discover tests", { cwd: submissionCWD });
    parsedResults = parseUnittestOutput(testResult.stdout + testResult.stderr);

    return NextResponse.json({
      message: "Tests completed",
      output: testResult.stdout + testResult.stderr,
      results: {
        run: parsedResults.testsRun,
        passed: parsedResults.testsRun - parsedResults.failures - parsedResults.errors,
        failed: parsedResults.failures,
        errors: parsedResults.errors
      }
    });
  } catch (error: any) {
    if (error.cmd === 'python3 -m unittest discover tests') {
      parsedResults = parseUnittestOutput(error.message);
      return NextResponse.json({
        message: "Tests completed",
        output: error.message,
        results: {
          run: parsedResults.testsRun,
          passed: parsedResults.testsRun - parsedResults.failures - parsedResults.errors,
          failed: parsedResults.failures,
          errors: parsedResults.errors
        }
      });
    }
    else {
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
