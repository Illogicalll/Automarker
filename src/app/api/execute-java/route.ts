// This file handles the API endpoint for executing and testing Java programming assignments
// It compiles and runs student Java submissions, capturing test results,
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
    if (relativePath.startsWith('__MACOSX/') || relativePath.startsWith('.')) {
      return;
    }

    if (!file.dir) {
      files.push({
        path: path.join(targetDir, relativePath),
        content: file.async('nodebuffer')
      });
    } else {
      files.push({
        path: path.join(targetDir, relativePath),
        dir: true
      });
    }
  });

  // Create directories first
  const dirs = files.filter((f: { dir: any; }) => f.dir);
  for (const dir of dirs) {
    await fs.mkdir(dir.path, { recursive: true });
  }

  // Then write files in parallel
  const fileWrites = files.filter((f: { dir: any; }) => !f.dir);
  await Promise.all(fileWrites.map(async (file: { path: any; content: any; }) => {
    await fs.mkdir(path.dirname(file.path), { recursive: true });
    const content = await file.content;
    await fs.writeFile(file.path, content);
  }));
}

/**
 * Interface defining the structure of Java test results
 */
interface TestResults {
  testsRun: number;
  failures: number;
  errors: number;
  skipped: number;
}

/**
 * Parses the Maven test output to extract test statistics.
 * Takes the raw output from Maven test run and returns structured
 * test results with counts of tests run, failures, errors and skipped.
 * Returns null if no test results can be found in the output.
 */
function parseMavenOutput(output: string): TestResults | null {
  const testResultsRegex = /Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)/;

  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(testResultsRegex);
    if (match) {

      const testsRun = parseInt(match[1], 10);
      const failures = parseInt(match[2], 10);
      const errors = parseInt(match[3], 10);
      const skipped = parseInt(match[4], 10);

      return { testsRun, failures, errors, skipped };
    }
  }

  return null;
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
 * Main API handler for POST requests.
 * Processes Java submission files, runs tests, and returns test results with performance metrics.
 */
export async function POST(req: NextRequest) {
  // Create temporary directories for processing
  const workDir = path.join(tmpdir(), uuidv4());
  const modelSolutionDir = path.join(workDir, "modelSolution");
  const submissionDir = path.join(workDir, "submission");

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

    // Find the root folder in the submission, skipping hidden and system folders
    const submissionContents = await fs.readdir(submissionDir);
    const rootFolderName = submissionContents.find(
      name => !name.startsWith('.') && !name.startsWith('__')
    );

    if (!rootFolderName) {
      throw new Error("Could not determine root folder name");
    }

    // Copy test files from model solution to submission src directory
    const submissionSrcPath = path.join(submissionDir, rootFolderName, "src");
    const modelSolutionFiles = await fs.readdir(modelSolutionDir);
    for (const file of modelSolutionFiles) {
      const sourcePath = path.join(modelSolutionDir, file);
      const destPath = path.join(submissionSrcPath, file);
      await fs.cp(sourcePath, destPath, { recursive: true, force: true });
    }

    // Verify that pom.xml exists in the submission
    const pomPath = path.join(submissionDir, rootFolderName, "pom.xml");
    try {
      await fs.access(pomPath);
    } catch {
      throw new Error("pom.xml not found in submission root directory");
    }

    // Run tests on the submission using Maven
    const testResult = await execAsync("mvn test", {
      cwd: path.join(submissionDir, rootFolderName)
    });

    // Build the project
    const otherResult = await execAsync("mvn clean package", {
      cwd: path.join(submissionDir, rootFolderName)
    });

    // Find the generated JAR file
    const jarFiles = await fs.readdir(path.join(submissionDir, rootFolderName, "target"));
    const jarFile = jarFiles.find(file => file.endsWith(".jar"));
    if (!jarFile) {
      throw new Error("No JAR file found in target directory");
    }

    // Measure performance metrics over multiple runs for more accurate results
    let totalExecutionTime = 0;
    let totalMemoryUsage = 0;
    const runs = 10;

    for (let i = 0; i < runs; i++) {
      const { executionTime, memoryUsage } = await measureExecutionTimeAndMemory(`gtime -v java -jar target/${jarFile}`, path.join(submissionDir, rootFolderName));
      totalExecutionTime += executionTime;
      totalMemoryUsage += memoryUsage;
    }

    // Calculate averages with fixed precision
    const avgExecutionTime = parseFloat((totalExecutionTime / runs).toFixed(3));
    const avgMemoryUsage = parseFloat((totalMemoryUsage / runs).toFixed(3));

    // Parse test results from Maven output
    const parsedResults = parseMavenOutput(testResult.stdout);

    // Return test results and performance metrics
    return NextResponse.json({
      message: "Tests completed",
      output: testResult.stdout,
      results: parsedResults ? {
        run: parsedResults.testsRun,
        passed: parsedResults.testsRun - parsedResults.failures - parsedResults.errors,
        failed: parsedResults.failures,
        skipped: parsedResults.skipped,
        avgExecutionTime,
        avgMemoryUsage
      } : null
    });

  } catch (error: any) {
    // Handle build/test failure cases - still extract test results when possible
    if (error.cmd === 'mvn test') {
      const parsedResults = parseMavenOutput(error.stdout);

      return NextResponse.json({
        message: "Tests completed",
        output: error.stdout,
        results: parsedResults ? {
          run: parsedResults.testsRun,
          passed: parsedResults.testsRun - parsedResults.failures - parsedResults.errors,
          failed: parsedResults.failures,
          skipped: parsedResults.skipped
        } : null
      });
    } else {
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