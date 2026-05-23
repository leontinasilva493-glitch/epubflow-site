import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import type {
  ConversionErrorCode,
  ConversionJobPublic,
  ConversionStatus,
  EpubPdfJob,
} from './types';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const JOB_TTL_MS = 60 * 60 * 1000;
const CONVERSION_TIMEOUT_MS = 120 * 1000;
const JOB_ROOT = path.join(os.tmpdir(), 'epubflow-jobs');
const JOBS_FILE = path.join(JOB_ROOT, 'jobs.json');

let jobsCache: Record<string, EpubPdfJob> | null = null;

async function ensureRoot() {
  await fs.mkdir(JOB_ROOT, { recursive: true });
}

async function readJobs() {
  if (jobsCache) return jobsCache;
  await ensureRoot();
  try {
    const raw = await fs.readFile(JOBS_FILE, 'utf-8');
    jobsCache = JSON.parse(raw) as Record<string, EpubPdfJob>;
  } catch {
    jobsCache = {};
  }
  return jobsCache;
}

async function writeJobs(jobs: Record<string, EpubPdfJob>) {
  jobsCache = jobs;
  await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

function nowIso() {
  return new Date().toISOString();
}

function isEpubFile(file: File) {
  const lower = file.name.toLowerCase();
  return lower.endsWith('.epub');
}

function isZipHeader(buffer: Buffer) {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
  );
}

function classifyError(message: string): ConversionErrorCode {
  const text = message.toLowerCase();
  if (text.includes('no such file') || text.includes('not recognized')) {
    return 'CONVERTER_NOT_AVAILABLE';
  }
  if (text.includes('timeout')) return 'CONVERSION_TIMEOUT';
  if (text.includes('drm')) return 'DRM_PROTECTED';
  if (text.includes('zip') || text.includes('corrupt') || text.includes('invalid')) {
    return 'CORRUPTED_EPUB';
  }
  return 'CONVERSION_FAILED';
}

function errorMessageFor(code: ConversionErrorCode) {
  switch (code) {
    case 'INVALID_FILE':
      return 'Please upload a valid .epub file.';
    case 'FILE_TOO_LARGE':
      return 'File is too large. Free limit is 50MB.';
    case 'CORRUPTED_EPUB':
      return 'This EPUB appears corrupted or unreadable.';
    case 'DRM_PROTECTED':
      return 'DRM-protected EPUB is not supported.';
    case 'CONVERSION_TIMEOUT':
      return 'Conversion timed out. Please try a smaller EPUB.';
    case 'CONVERTER_NOT_AVAILABLE':
      return 'Conversion engine is not available on this server.';
    case 'NOT_FOUND':
      return 'Conversion job not found.';
    case 'EXPIRED':
      return 'This conversion has expired. Please upload again.';
    default:
      return 'Conversion failed. Please try again.';
  }
}

async function setJobStatus(
  id: string,
  status: ConversionStatus,
  errorCode?: ConversionErrorCode
) {
  const jobs = await readJobs();
  const job = jobs[id];
  if (!job) return;
  job.status = status;
  job.updatedAt = nowIso();
  if (errorCode) {
    job.errorCode = errorCode;
    job.errorMessage = errorMessageFor(errorCode);
  }
  await writeJobs(jobs);
}

async function cleanupExpiredJobs() {
  const jobs = await readJobs();
  const now = Date.now();
  let changed = false;
  for (const [id, job] of Object.entries(jobs)) {
    if (new Date(job.expiresAt).getTime() > now) continue;
    changed = true;
    try {
      await fs.rm(path.dirname(job.inputPath), { recursive: true, force: true });
    } catch {}
    delete jobs[id];
  }
  if (changed) await writeJobs(jobs);
}

async function runEbookConvert(inputPath: string, outputPath: string) {
  return new Promise<{ ok: boolean; stderr: string; timedOut: boolean }>((resolve) => {
    const child = spawn('ebook-convert', [inputPath, outputPath], {
      env: {
        ...process.env,
        QTWEBENGINE_DISABLE_SANDBOX: '1',
        QTWEBENGINE_CHROMIUM_FLAGS: '--no-sandbox',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, CONVERSION_TIMEOUT_MS);
    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ ok: code === 0 && !timedOut, stderr, timedOut });
    });
    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ ok: false, stderr: err.message, timedOut: false });
    });
  });
}

async function processJob(id: string) {
  try {
    await setJobStatus(id, 'reading_epub');
    await setJobStatus(id, 'converting');
    const jobs = await readJobs();
    const job = jobs[id];
    if (!job) return;
    const result = await runEbookConvert(job.inputPath, job.outputPath);
    if (!result.ok) {
      const code = result.timedOut
        ? 'CONVERSION_TIMEOUT'
        : classifyError(result.stderr);
      await setJobStatus(id, 'failed', code);
      return;
    }
    await setJobStatus(id, 'preparing_download');
    const stat = await fs.stat(job.outputPath);
    if (!stat.isFile() || stat.size <= 0) {
      await setJobStatus(id, 'failed', 'CONVERSION_FAILED');
      return;
    }
    await setJobStatus(id, 'success');
  } catch {
    await setJobStatus(id, 'failed', 'CONVERSION_FAILED');
  }
}

function sanitizeName(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[^\w\-]+/g, '_');
}

export async function createEpubPdfJob(file: File) {
  await cleanupExpiredJobs();
  if (!isEpubFile(file)) {
    return {
      ok: false as const,
      errorCode: 'INVALID_FILE' as const,
      errorMessage: errorMessageFor('INVALID_FILE'),
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false as const,
      errorCode: 'FILE_TOO_LARGE' as const,
      errorMessage: errorMessageFor('FILE_TOO_LARGE'),
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!isZipHeader(bytes)) {
    return {
      ok: false as const,
      errorCode: 'CORRUPTED_EPUB' as const,
      errorMessage: errorMessageFor('CORRUPTED_EPUB'),
    };
  }

  const id = randomUUID();
  const dir = path.join(JOB_ROOT, id);
  await fs.mkdir(dir, { recursive: true });
  const inputPath = path.join(dir, 'input.epub');
  const outputFilename = `${sanitizeName(file.name)}.pdf`;
  const outputPath = path.join(dir, outputFilename);
  await fs.writeFile(inputPath, bytes);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + JOB_TTL_MS);
  const job: EpubPdfJob = {
    id,
    status: 'pending',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    inputFilename: file.name,
    inputSize: file.size,
    inputPath,
    outputPath,
    outputFilename,
  };
  const jobs = await readJobs();
  jobs[id] = job;
  await writeJobs(jobs);
  queueMicrotask(() => {
    void processJob(id);
  });
  return { ok: true as const, jobId: id };
}

export async function getPublicJob(
  id: string
): Promise<ConversionJobPublic | null> {
  await cleanupExpiredJobs();
  const jobs = await readJobs();
  const job = jobs[id];
  if (!job) return null;
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    expiresAt: job.expiresAt,
    inputFilename: job.inputFilename,
    inputSize: job.inputSize,
    downloadUrl:
      job.status === 'success' ? `/api/conversions/${job.id}/download` : null,
    errorCode: job.errorCode ?? null,
    errorMessage: job.errorMessage ?? null,
  };
}

export async function getJobFilePath(id: string) {
  await cleanupExpiredJobs();
  const jobs = await readJobs();
  const job = jobs[id];
  if (!job) return { ok: false as const, code: 'NOT_FOUND' as const };
  if (new Date(job.expiresAt).getTime() <= Date.now()) {
    return { ok: false as const, code: 'EXPIRED' as const };
  }
  if (job.status !== 'success') {
    return { ok: false as const, code: 'CONVERSION_FAILED' as const };
  }
  return {
    ok: true as const,
    outputPath: job.outputPath,
    outputFilename: job.outputFilename,
  };
}

export function getErrorMessage(code: ConversionErrorCode) {
  return errorMessageFor(code);
}
