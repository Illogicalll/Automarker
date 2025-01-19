import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { IncomingForm } from 'formidable';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

const executeCode = async (language: string, filePath: string): Promise<string> => {
  switch (language) {
    case 'javascript':
      return new Promise((resolve, reject) => {
        exec(`node ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
          } else {
            resolve(stdout);
          }
        });
      });
    case 'python':
      return new Promise((resolve, reject) => {
        exec(`python3 ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
          } else {
            resolve(stdout);
          }
        });
      });
    case 'cpp': {
      const outputPath = filePath.replace(/\.cpp$/, '');
      return new Promise((resolve, reject) => {
        exec(`g++ ${filePath} -o ${outputPath} && ${outputPath}`, (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
          } else {
            resolve(stdout);
          }
        });
      });
    }
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};

const extractZip = async (zipPath: string, outputDir: string): Promise<string[]> => {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputDir, true);
  return zip.getEntries().map((entry) => path.join(outputDir, entry.entryName));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const tempDir = path.join(process.cwd(), 'temp');

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });

    const form = new IncomingForm({ uploadDir, keepExtensions: true });
    const data = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { language } = data.fields; // Language is passed as a field
    const zipFile = data.files.file; // Uploaded .zip file

    if (!zipFile) {
      throw new Error('No file uploaded');
    }

    // Extract the .zip
    const extractedFiles = await extractZip(zipFile.filepath, tempDir);

    // Determine the main file (e.g., main.py, index.js, etc.)
    const mainFile = extractedFiles.find((file) => {
      if (language === 'javascript') return file.endsWith('index.js');
      if (language === 'python') return file.endsWith('main.py');
      if (language === 'cpp') return file.endsWith('main.cpp');
      return false;
    });

    if (!mainFile) {
      throw new Error('Could not find an appropriate main file in the .zip');
    }

    // Execute the main file
    const result = await executeCode(language, mainFile);

    // Cleanup files
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(uploadDir, { recursive: true, force: true });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}