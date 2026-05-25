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
const ROOT =
  process.env.EPUBFLOW_CONVERTER_DATA_DIR ||
  path.join(os.tmpdir(), 'epubflow-converter-jobs');
const JOBS_FILE = path.join(ROOT, 'jobs.json');
const METRICS_RETENTION_DAYS = 30;
const FORMAT_CONFIG = {
  pdf: { extension: 'pdf', mime: 'application/pdf', label: 'PDF' },
  mobi: {
    extension: 'mobi',
    mime: 'application/x-mobipocket-ebook',
    label: 'Kindle (MOBI)',
  },
  azw3: {
    extension: 'azw3',
    mime: 'application/vnd.amazon.mobi8-ebook',
    label: 'Kindle (AZW3)',
  },
  txt: {
    extension: 'txt',
    mime: 'text/plain; charset=utf-8',
    label: 'Plain Text',
  },
  docx: {
    extension: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Word (DOCX)',
  },
};

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

function getMetricsFilePath(date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  return path.join(ROOT, `metrics-${day}.jsonl`);
}

async function appendMetric(event, payload = {}) {
  try {
    await ensureRoot();
    const line = JSON.stringify({
      event,
      timestamp: nowIso(),
      ...payload,
    });
    await fs.appendFile(getMetricsFilePath(), `${line}\n`, 'utf-8');
  } catch (error) {
    console.error('[metrics] append failed', String(error));
  }
}

async function pruneMetricFiles() {
  try {
    await ensureRoot();
    const files = await fs.readdir(ROOT);
    const now = Date.now();
    await Promise.all(
      files
        .filter((name) => /^metrics-\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
        .map(async (name) => {
          const day = name.slice('metrics-'.length, 'metrics-'.length + 10);
          const ts = Date.parse(`${day}T00:00:00.000Z`);
          if (Number.isNaN(ts)) return;
          const ageDays = (now - ts) / (24 * 60 * 60 * 1000);
          if (ageDays > METRICS_RETENTION_DAYS) {
            await fs.rm(path.join(ROOT, name), { force: true });
          }
        })
    );
  } catch (error) {
    console.error('[metrics] prune failed', String(error));
  }
}

async function readMetricEvents(days = 7) {
  await ensureRoot();
  const files = await fs.readdir(ROOT);
  const targetDays = new Set();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    targetDays.add(d.toISOString().slice(0, 10));
  }

  const metricFiles = files.filter((name) => {
    const matched = name.match(/^metrics-(\d{4}-\d{2}-\d{2})\.jsonl$/);
    return matched ? targetDays.has(matched[1]) : false;
  });

  const events = [];
  for (const fileName of metricFiles) {
    const filePath = path.join(ROOT, fileName);
    const raw = await fs.readFile(filePath, 'utf-8');
    const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      try {
        events.push(JSON.parse(line));
      } catch {}
    }
  }
  return events;
}

function aggregateMetrics(events) {
  const totals = {
    uploads: 0,
    rejectedUploads: 0,
    convertStarted: 0,
    success: 0,
    failed: 0,
    timeout: 0,
    downloadStarted: 0,
    downloadFailed: 0,
    avgDurationMs: 0,
    successRate: 0,
    failureRate: 0,
    timeoutRate: 0,
    acceptanceRate: 0,
  };
  const failureByType = {};
  const byFormat = {};

  function ensureFormatBucket(format) {
    const key = format || 'unknown';
    if (!byFormat[key]) {
      byFormat[key] = {
        uploads: 0,
        rejectedUploads: 0,
        convertStarted: 0,
        success: 0,
        failed: 0,
        downloadStarted: 0,
        downloadFailed: 0,
      };
    }
    return byFormat[key];
  }

  let durationTotal = 0;
  let durationCount = 0;

  for (const event of events) {
    const bucket = ensureFormatBucket(event.targetFormat || 'unknown');
    if (event.event === 'upload_started') {
      totals.uploads += 1;
      bucket.uploads += 1;
    }
    if (event.event === 'upload_rejected') {
      totals.rejectedUploads += 1;
      bucket.rejectedUploads += 1;
    }
    if (event.event === 'convert_started') {
      totals.convertStarted += 1;
      bucket.convertStarted += 1;
    }
    if (event.event === 'convert_succeeded') {
      totals.success += 1;
      bucket.success += 1;
      if (typeof event.duration_ms === 'number' && event.duration_ms >= 0) {
        durationTotal += event.duration_ms;
        durationCount += 1;
      }
    }
    if (event.event === 'convert_failed') {
      totals.failed += 1;
      bucket.failed += 1;
      const key = event.error_type || 'unknown';
      failureByType[key] = (failureByType[key] || 0) + 1;
      if (key === 'timeout') totals.timeout += 1;
    }
    if (event.event === 'download_started') {
      totals.downloadStarted += 1;
      bucket.downloadStarted += 1;
    }
    if (event.event === 'download_failed') {
      totals.downloadFailed += 1;
      bucket.downloadFailed += 1;
    }
  }

  const finished = totals.success + totals.failed;
  totals.avgDurationMs = durationCount > 0 ? Math.round(durationTotal / durationCount) : 0;
  totals.successRate = finished > 0 ? Number((totals.success / finished).toFixed(4)) : 0;
  totals.failureRate = finished > 0 ? Number((totals.failed / finished).toFixed(4)) : 0;
  totals.timeoutRate = finished > 0 ? Number((totals.timeout / finished).toFixed(4)) : 0;
  totals.acceptanceRate =
    totals.uploads > 0
      ? Number((totals.convertStarted / totals.uploads).toFixed(4))
      : 0;

  return { totals, failureByType, byFormat };
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

function normalizeErrorType(errorCode) {
  switch (errorCode) {
    case 'DRM_PROTECTED':
      return 'drm_protected';
    case 'CORRUPTED_EPUB':
      return 'corrupted_file';
    case 'CONVERSION_TIMEOUT':
      return 'timeout';
    case 'CONVERTER_NOT_AVAILABLE':
      return 'converter_unavailable';
    case 'INVALID_FILE':
      return 'invalid_file';
    case 'FILE_TOO_LARGE':
      return 'oversized_file';
    default:
      return 'unknown';
  }
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
  await appendMetric('convert_started', {
    job_id: id,
    targetFormat: job.targetFormat,
    file_size_mb: Number((job.inputSize / (1024 * 1024)).toFixed(2)),
  });
  const startedAt = Date.now();
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
    await appendMetric('convert_failed', {
      job_id: id,
      targetFormat: job.targetFormat,
      duration_ms: Date.now() - startedAt,
      error_type: normalizeErrorType(error.code),
    });
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
  await appendMetric('convert_succeeded', {
    job_id: id,
    targetFormat: job.targetFormat,
    duration_ms: Date.now() - startedAt,
  });
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

async function handleCreate(req, res, format) {
  if (!verifyApiKey(req, res)) return;
  await cleanupExpired();
  if (!FORMAT_CONFIG[format]) {
    json(res, 400, {
      errorCode: 'INVALID_FORMAT',
      errorMessage: 'Unsupported conversion format.',
    });
    return;
  }
  const { fileName, buffer, tooLarge } = await parseMultipart(req);

  if (!fileName || !fileName.toLowerCase().endsWith('.epub')) {
    await appendMetric('upload_rejected', {
      targetFormat: format,
      error_type: 'invalid_file',
    });
    json(res, 400, { errorCode: 'INVALID_FILE', errorMessage: 'Please upload a valid .epub file.' });
    return;
  }
  if (tooLarge || buffer.length > MAX_BYTES) {
    await appendMetric('upload_rejected', {
      targetFormat: format,
      error_type: 'oversized_file',
      file_size_mb: Number((buffer.length / (1024 * 1024)).toFixed(2)),
    });
    json(res, 400, { errorCode: 'FILE_TOO_LARGE', errorMessage: 'File is too large. Free limit is 50MB.' });
    return;
  }
  if (!isZipHeader(buffer)) {
    await appendMetric('upload_rejected', {
      targetFormat: format,
      error_type: 'corrupted_file',
    });
    json(res, 400, { errorCode: 'CORRUPTED_EPUB', errorMessage: 'This EPUB appears corrupted or unreadable.' });
    return;
  }

  const id = randomUUID();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + JOB_TTL_MS).toISOString();
  const dir = path.join(ROOT, id);
  await fs.mkdir(dir, { recursive: true });
  const inputPath = path.join(dir, 'input.epub');
  const outputExt = FORMAT_CONFIG[format].extension;
  const outputFilename = `${fileName.replace(/\.[^.]+$/, '').replace(/[^\w\-]+/g, '_')}.${outputExt}`;
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
    targetFormat: format,
    errorCode: null,
    errorMessage: null,
  };
  await saveJobs();
  queueMicrotask(() => {
    void processJob(id);
  });
  json(res, 200, { jobId: id, status: 'uploading' });
}

async function handlePostMetric(req, res) {
  if (!verifyApiKey(req, res)) return;
  let payload = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf-8');
    payload = body ? JSON.parse(body) : {};
  } catch {
    json(res, 400, { errorCode: 'INVALID_JSON', errorMessage: 'Invalid JSON body.' });
    return;
  }
  const { event, ...rest } = payload || {};
  if (!event || typeof event !== 'string') {
    json(res, 400, { errorCode: 'INVALID_EVENT', errorMessage: 'event is required.' });
    return;
  }
  await appendMetric(event, rest);
  await pruneMetricFiles();
  json(res, 200, { ok: true });
}

async function handleGetMetrics(req, res) {
  if (!verifyApiKey(req, res)) return;
  await pruneMetricFiles();
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const daysRaw = Number(url.searchParams.get('days') || 7);
  const days = Number.isFinite(daysRaw) && daysRaw > 0 && daysRaw <= 30 ? daysRaw : 7;
  const events = await readMetricEvents(days);
  const aggregated = aggregateMetrics(events);
  json(res, 200, {
    ok: true,
    days,
    generatedAt: nowIso(),
    eventCount: events.length,
    ...aggregated,
  });
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
    targetFormat: job.targetFormat || 'pdf',
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
  const mime = FORMAT_CONFIG[job.targetFormat]?.mime || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': mime,
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

    const matchCreate = url.pathname.match(/^\/v1\/conversions\/epub-to-([a-z0-9]+)$/);
    if (req.method === 'POST' && matchCreate) {
      await handleCreate(req, res, matchCreate[1]);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/metrics') {
      await handlePostMetric(req, res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/metrics') {
      await handleGetMetrics(req, res);
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
