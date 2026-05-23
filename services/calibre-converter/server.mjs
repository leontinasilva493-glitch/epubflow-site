import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import Busboy from 'busboy';

const PORT = Number(process.env.PORT || 4000);
const API_KEY = process.env.EPUBFLOW_CONVERTER_API_KEY || '';
const JOB_TTL_MS = 60 * 60 * 1000;
const MAX_BYTES = 50 * 1024 * 1024;
const CONVERSION_TIMEOUT_MS = 120 * 1000;
const ROOT = path.join(os.tmpdir(), 'epubflow-converter-jobs');
const JOBS_FILE = path.join(ROOT, 'jobs.json');

let jobs = null;

function checkConverter() {
  const result = spawnSync('ebook-convert', ['--version'], { encoding: 'utf-8' });
  if (result.error || result.status !== 0) {
    return {
      available: false,
      version: null,
      detail: result.error?.message || result.stderr || 'ebook-convert not available',
    };
  }
  return {
    available: true,
    version: (result.stdout || '').trim() || 'unknown',
    detail: null,
  };
}

function json(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function ensureRoot() {
  await fs.mkdir(ROOT, { recursive: true });
}

async function loadJobs() {
  if (jobs) return jobs;
  await ensureRoot();
  try {
    const raw = await fs.readFile(JOBS_FILE, 'utf-8');
    jobs = JSON.parse(raw);
  } catch {
    jobs = {};
  }
  return jobs;
}

async function saveJobs() {
  await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

function nowIso() {
  return new Date().toISOString();
}

function isZipHeader(buffer) {
  if (!buffer || buffer.length < 4) return false;
  return buffer[0] === 0x50 && buffer[1] === 0x4b;
}

function classifyError(message) {
  const text = String(message || '').toLowerCase();
  if (text.includes('not recognized') || text.includes('enoent')) {
    return { code: 'CONVERTER_NOT_AVAILABLE', message: 'Conversion engine is not available on this server.' };
  }
  if (text.includes('timeout')) {
    return { code: 'CONVERSION_TIMEOUT', message: 'Conversion timed out. Please try a smaller EPUB.' };
  }
  if (text.includes('drm')) {
    return { code: 'DRM_PROTECTED', message: 'DRM-protected EPUB is not supported.' };
  }
  if (text.includes('corrupt') || text.includes('invalid') || text.includes('zip')) {
    return { code: 'CORRUPTED_EPUB', message: 'This EPUB appears corrupted or unreadable.' };
  }
  return { code: 'CONVERSION_FAILED', message: 'Conversion failed. Please try again.' };
}

async function cleanupExpired() {
  await loadJobs();
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
  if (changed) await saveJobs();
}

async function setStatus(id, status, error = null) {
  await loadJobs();
  const job = jobs[id];
  if (!job) return;
  job.status = status;
  job.updatedAt = nowIso();
  if (error) {
    job.errorCode = error.code;
    job.errorMessage = error.message;
  }
  await saveJobs();
}

function runConvert(inputPath, outputPath) {
  return new Promise((resolve) => {
    const child = spawn('ebook-convert', [inputPath, outputPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, CONVERSION_TIMEOUT_MS);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0 && !timedOut, timedOut, stderr });
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, timedOut: false, stderr: err.message });
    });
  });
}

async function processJob(id) {
  await setStatus(id, 'reading_epub');
  await setStatus(id, 'converting');
  await loadJobs();
  const job = jobs[id];
  if (!job) return;
  const result = await runConvert(job.inputPath, job.outputPath);
  if (!result.ok) {
    console.error('[converter] job failed', {
      jobId: id,
      timedOut: result.timedOut,
      stderr: result.stderr?.slice(0, 4000),
    });
    const error = result.timedOut
      ? { code: 'CONVERSION_TIMEOUT', message: 'Conversion timed out. Please try a smaller EPUB.' }
      : classifyError(result.stderr);
    await setStatus(id, 'failed', error);
    return;
  }
  await setStatus(id, 'preparing_download');
  try {
    const stat = await fs.stat(job.outputPath);
    if (!stat.isFile() || stat.size <= 0) {
      await setStatus(id, 'failed', {
        code: 'CONVERSION_FAILED',
        message: 'Conversion failed. Please try again.',
      });
      return;
    }
  } catch {
    await setStatus(id, 'failed', {
      code: 'CONVERSION_FAILED',
      message: 'Conversion failed. Please try again.',
    });
    return;
  }
  await setStatus(id, 'success');
}

function verifyApiKey(req, res) {
  if (!API_KEY) return true;
  if (req.headers['x-api-key'] === API_KEY) return true;
  json(res, 401, { errorCode: 'UNAUTHORIZED', errorMessage: 'Invalid converter API key.' });
  return false;
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_BYTES } });
    let fileName = '';
    let chunks = [];
    let tooLarge = false;
    bb.on('file', (_name, file, info) => {
      fileName = info.filename || '';
      file.on('limit', () => {
        tooLarge = true;
      });
      file.on('data', (chunk) => chunks.push(chunk));
    });
    bb.on('close', () => {
      resolve({ fileName, buffer: Buffer.concat(chunks), tooLarge });
    });
    bb.on('error', reject);
    req.pipe(bb);
  });
}

async function handleCreate(req, res) {
  if (!verifyApiKey(req, res)) return;
  await cleanupExpired();
  const { fileName, buffer, tooLarge } = await parseMultipart(req);

  if (!fileName || !fileName.toLowerCase().endsWith('.epub')) {
    json(res, 400, { errorCode: 'INVALID_FILE', errorMessage: 'Please upload a valid .epub file.' });
    return;
  }
  if (tooLarge || buffer.length > MAX_BYTES) {
    json(res, 400, { errorCode: 'FILE_TOO_LARGE', errorMessage: 'File is too large. Free limit is 50MB.' });
    return;
  }
  if (!isZipHeader(buffer)) {
    json(res, 400, { errorCode: 'CORRUPTED_EPUB', errorMessage: 'This EPUB appears corrupted or unreadable.' });
    return;
  }

  const id = randomUUID();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + JOB_TTL_MS).toISOString();
  const dir = path.join(ROOT, id);
  await fs.mkdir(dir, { recursive: true });
  const inputPath = path.join(dir, 'input.epub');
  const outputFilename = `${fileName.replace(/\.[^.]+$/, '').replace(/[^\w\-]+/g, '_')}.pdf`;
  const outputPath = path.join(dir, outputFilename);
  await fs.writeFile(inputPath, buffer);
  await loadJobs();
  jobs[id] = {
    id,
    status: 'pending',
    createdAt,
    updatedAt: createdAt,
    expiresAt,
    inputFilename: fileName,
    inputSize: buffer.length,
    inputPath,
    outputPath,
    outputFilename,
    errorCode: null,
    errorMessage: null,
  };
  await saveJobs();
  queueMicrotask(() => {
    void processJob(id);
  });
  json(res, 200, { jobId: id, status: 'uploading' });
}

async function handleGetJob(req, res, jobId) {
  if (!verifyApiKey(req, res)) return;
  await cleanupExpired();
  await loadJobs();
  const job = jobs[jobId];
  if (!job) {
    json(res, 404, { errorCode: 'NOT_FOUND', errorMessage: 'Conversion job not found.' });
    return;
  }
  json(res, 200, {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    expiresAt: job.expiresAt,
    inputFilename: job.inputFilename,
    inputSize: job.inputSize,
    downloadUrl: job.status === 'success' ? `/v1/conversions/${job.id}/download` : null,
    errorCode: job.errorCode || null,
    errorMessage: job.errorMessage || null,
  });
}

async function handleDownload(req, res, jobId) {
  if (!verifyApiKey(req, res)) return;
  await cleanupExpired();
  await loadJobs();
  const job = jobs[jobId];
  if (!job) {
    json(res, 404, { errorCode: 'NOT_FOUND', errorMessage: 'Conversion job not found.' });
    return;
  }
  if (job.status !== 'success') {
    json(res, 400, { errorCode: 'CONVERSION_FAILED', errorMessage: 'Conversion is not completed yet.' });
    return;
  }
  const bytes = await fs.readFile(job.outputPath);
  res.writeHead(200, {
    'content-type': 'application/pdf',
    'content-disposition': `attachment; filename="${job.outputFilename}"`,
    'cache-control': 'no-store',
  });
  res.end(bytes);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/healthz') {
      const converter = checkConverter();
      json(res, 200, { ok: true, converter });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/conversions/epub-to-pdf') {
      await handleCreate(req, res);
      return;
    }

    const matchStatus = url.pathname.match(/^\/v1\/conversions\/([^/]+)$/);
    if (req.method === 'GET' && matchStatus) {
      await handleGetJob(req, res, matchStatus[1]);
      return;
    }

    const matchDownload = url.pathname.match(/^\/v1\/conversions\/([^/]+)\/download$/);
    if (req.method === 'GET' && matchDownload) {
      await handleDownload(req, res, matchDownload[1]);
      return;
    }

    json(res, 404, { errorCode: 'NOT_FOUND', errorMessage: 'Not found.' });
  } catch (error) {
    json(res, 500, {
      errorCode: 'INTERNAL_ERROR',
      errorMessage: 'Internal server error.',
      detail: String(error),
    });
  }
});

server.listen(PORT, () => {
  console.log(`EPUBFlow Calibre converter listening on :${PORT}`);
});
