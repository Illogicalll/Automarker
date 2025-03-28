// This file handles the API endpoint for executing and testing Python programming assignments
// It runs student Python submissions against test cases, capturing test results,
// execution time, and memory usage statistics
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import { tmpdir } from "os";

// Convert exec to return a promise instead of using callbacks
const execAsync = promisify(exec);

/**
 * Extracts a ZIP file to a target directory.
 * Handles file organization and filtering of system files.
 * The zip parameter is the JSZip object containing the archive.
 * The targetDir parameter is the destination directory for extraction.
 */
async function extractZip(zip: JSZip, targetDir: string): Promise<void> {
  const files: any = [];
  zip.forEach((relativePath, file) => {
    // Skip macOS system files and hidden files
    if (relativePath.startsWith("__MACOSX/") || relativePath.startsWith(".")) {
      return;
    }
    if (!file.dir) {
      files.push({ path: path.join(targetDir, relativePath), content: file.async("nodebuffer") });
    } else {
      files.push({ path: path.join(targetDir, relativePath), dir: true });
    }
  });
  // Create directories first
  for (const dir of files.filter((f: { dir: any; }) => f.dir)) {
    await fs.mkdir(dir.path, { recursive: true });
  }
  // Then write files in parallel
  await Promise.all(
    files.filter((f: { dir: any; }) => !f.dir).map(async (file: { path: any; content: any; }) => {
      await fs.mkdir(path.dirname(file.path), { recursive: true });
      const content = await file.content;
      await fs.writeFile(file.path, content);
    })
  );
}

/**
 * Interface defining the structure of Python unittest results
 */
interface TestResults {
  testsRun: number;
  failures: number;
  errors: number;
}

/**
 * Parses the Python unittest output to extract test statistics.
 * Takes the raw output from the unittest run and returns structured
 * test results with counts of tests run, failures, and errors.
 */
function parseUnittestOutput(output: string): TestResults {
  const match = output.match(/Ran (\d+) tests?/);
  const failuresMatch = output.match(/FAILED \((failures=(\d+))?/);
  const errorsMatch = output.match(/errors=(\d+)/);
  
  const testsRun = match ? parseInt(match[1], 10) : 0;
  const failures = failuresMatch ? parseInt(failuresMatch[2] || "0", 10) : 0;
  const errors = errorsMatch ? parseInt(errorsMatch[1], 10) : 0;
  
  return { testsRun, failures, errors };
}

/**
 * Parses the output from gtime to extract performance metrics.
 * Takes the raw stderr output from gtime and returns an object 
 * containing execution time and memory usage metrics.
 */
function parseGtimeOutput(output: string): { executionTime: number, memoryUsage: number } {
  const timeRegex = /User time \(seconds\): (\d+\.\d+)/;
  const memoryRegex = /Maximum resident set size \(kbytes\): (\d+)/;

  const timeMatch = output.match(timeRegex);
  const memoryMatch = output.match(memoryRegex);

  if (!timeMatch || !memoryMatch) {
    throw new Error("Failed to parse gtime output");
  }

  const executionTime = parseFloat(timeMatch[1]);
  const memoryUsage = parseInt(memoryMatch[1], 10) / 1024; // Convert KB to MB

  return { executionTime, memoryUsage };
}

/**
 * Executes a command and measures its execution time and memory usage using gtime.
 * Takes the command to execute and the current working directory,
 * returns an object containing execution time and memory usage metrics.
 */
async function measureExecutionTimeAndMemory(command: string, cwd: string): Promise<{ executionTime: number, memoryUsage: number }> {
  const { stdout, stderr } = await execAsync(command, { cwd });
  return parseGtimeOutput(stderr);
}

/**
 * Identifies the root folder in a directory, skipping hidden and system folders.
 * Takes the directory to search in and returns the name of the root folder 
 * or null if none found.
 */
async function getRootFolder(directory: string): Promise<string | null> {
  const contents = await fs.readdir(directory);
  const rootFolder = contents.find(name => !name.startsWith('.') && !name.startsWith('__'));
  return rootFolder ? rootFolder : null;
}

/**
 * Main API handler for POST requests.
 * Processes Python submission files, runs tests, and returns test results with performance metrics.
 */
export async function POST(req: NextRequest) {
  // Create temporary directories for processing
  const workDir = path.join(tmpdir(), uuidv4());
  const modelSolutionDir = path.join(workDir, "modelSolution");
  const submissionDir = path.join(workDir, "submission");

  let testResult = {stdout: "", stderr: ""};
  let parsedResults = {testsRun: 0 , errors: 0, failures: 0};

  try {
    // Set up temporary working directories
    await fs.mkdir(workDir);
    await fs.mkdir(modelSolutionDir);
    await fs.mkdir(submissionDir);

    // Parse incoming form data
    const formData = await req.formData();
    const submissionZip = formData.get("submissionZip") as Blob;
    
    const assignmentId = formData.get("assignment_id");

    if (!assignmentId || !submissionZip) {
      throw new Error("Missing required fields");
    }

    // Fetch model solution from Supabase storage
    const supabase = createClient();
    const { data: modelSolutionData, error: downloadError } = await supabase.storage
      .from("model_solutions")
      .download(assignmentId.toString());

    if (downloadError) {
      throw new Error(`Error downloading model solution: ${downloadError.message}`);
    }

    // Extract model solution and submission files
    const modelSolutionBuffer = await modelSolutionData.arrayBuffer();
    const modelSolutionZip = await JSZip.loadAsync(modelSolutionBuffer);
    await extractZip(modelSolutionZip, modelSolutionDir);

    const submissionBuffer = await submissionZip.arrayBuffer();
    const submissionZipFile = await JSZip.loadAsync(submissionBuffer);
    await extractZip(submissionZipFile, submissionDir);

    // Set up the directory structure for testing
    const modelSolutionCWD = path.join(modelSolutionDir, `${await getRootFolder(modelSolutionDir)}`)
    const submissionCWD = path.join(submissionDir, `${await getRootFolder(submissionDir)}`)

    // Copy test files from model solution to submission directory
    const modelTestPath = path.join(modelSolutionCWD, "tests");
    const submissionTestPath = path.join(submissionCWD, "tests");
    await fs.cp(modelTestPath, submissionTestPath, { recursive: true, force: true });
    
    // Run Python unittest and parse results
    testResult = await execAsync("python3 -m unittest discover tests", { cwd: submissionCWD });
    parsedResults = parseUnittestOutput(testResult.stdout + testResult.stderr);

    // Measure performance metrics over multiple runs for more accurate results
    let totalExecutionTime = 0;
    let totalMemoryUsage = 0;
    const runs = 10;

    for (let i = 0; i < runs; i++) {
      const { executionTime, memoryUsage } = await measureExecutionTimeAndMemory(`gtime -v python3 -m unittest discover tests`, submissionCWD);
      totalExecutionTime += executionTime;
      totalMemoryUsage += memoryUsage;
    }

    // Calculate averages with fixed precision
    const avgExecutionTime = parseFloat((totalExecutionTime / runs).toFixed(3));
    const avgMemoryUsage = parseFloat((totalMemoryUsage / runs).toFixed(3));

    // Return test results and performance metrics
    return NextResponse.json({
      message: "Tests completed",
      output: testResult.stdout + testResult.stderr,
      results: {
        run: parsedResults.testsRun,
        passed: parsedResults.testsRun - parsedResults.failures - parsedResults.errors,
        failed: parsedResults.failures,
        errors: parsedResults.errors,
        avgExecutionTime,
        avgMemoryUsage
      }
    });
  } catch (error: any) {
    // Handle test failure cases - still extract test results when possible
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
      // Handle general errors
      console.error("Error processing request:", error);
      return NextResponse.json(
        { message: "Internal Server Error", error: error.message },
        { status: 500 }
      );
    }
  } finally {
    // Always clean up temporary files
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
}
