'use client';

import { Check, FileText, Loader2, Upload, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type UiPhase =
  | 'idle'
  | 'uploading'
  | 'reading_epub'
  | 'converting'
  | 'preparing_download'
  | 'success'
  | 'failed';

interface JobResponse {
  id: string;
  status: UiPhase;
  downloadUrl: string | null;
  errorMessage: string | null;
}

const MAX_MB = 50;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function phaseLabel(phase: UiPhase) {
  switch (phase) {
    case 'uploading':
      return 'Uploading file';
    case 'reading_epub':
      return 'Reading EPUB';
    case 'converting':
      return 'Converting to PDF';
    case 'preparing_download':
      return 'Preparing download';
    case 'success':
      return 'Conversion complete';
    case 'failed':
      return 'Conversion failed';
    default:
      return 'Ready to convert';
  }
}

function phaseProgress(phase: UiPhase) {
  switch (phase) {
    case 'uploading':
      return 15;
    case 'reading_epub':
      return 35;
    case 'converting':
      return 70;
    case 'preparing_download':
      return 90;
    case 'success':
      return 100;
    case 'failed':
      return 0;
    default:
      return 0;
  }
}

export function EpubPdfWorkbench() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UiPhase>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || phase === 'success' || phase === 'failed') return;
    const timer = setInterval(async () => {
      const response = await fetch(`/api/conversions/${jobId}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        setPhase('failed');
        setError('Failed to check conversion status.');
        clearInterval(timer);
        return;
      }
      const data = (await response.json()) as JobResponse;
      setPhase(data.status);
      setDownloadUrl(data.downloadUrl);
      if (data.status === 'failed') {
        setError(data.errorMessage || 'Conversion failed.');
        clearInterval(timer);
      }
      if (data.status === 'success') {
        clearInterval(timer);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [jobId, phase]);

  const fileSizeLabel = useMemo(() => {
    if (!file) return '';
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [file]);

  const disabled = phase !== 'idle' && phase !== 'failed' && phase !== 'success';

  const onChooseFile = () => fileInputRef.current?.click();

  const onFileSelected = (nextFile: File | null) => {
    setError(null);
    setDownloadUrl(null);
    setJobId(null);
    setPhase('idle');

    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!nextFile.name.toLowerCase().endsWith('.epub')) {
      setFile(null);
      setError('Only .epub files are allowed.');
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setFile(null);
      setError(`File is too large. Limit is ${MAX_MB}MB.`);
      return;
    }
    setFile(nextFile);
  };

  const onConvert = async () => {
    if (!file) {
      setError('Please upload an EPUB file first.');
      return;
    }
    setError(null);
    setPhase('uploading');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/conversions/epub-to-pdf', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      setPhase('failed');
      setError(data.errorMessage || 'Failed to create conversion job.');
      return;
    }
    setJobId(data.jobId as string);
  };

  return (
    <div className="grid xl:grid-cols-[1fr_320px]">
      <div className="border-b border-r border-[#eef0f3] p-6 xl:border-b-0">
        <h3 className="text-sm font-semibold text-[#111827]">1. Upload your EPUB</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={onChooseFile}
          className="mt-3 flex h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#d1d5db] bg-white text-center transition hover:bg-[#fafafa]"
        >
          <Upload className="mb-2 h-5 w-5 text-[#4b5563]" />
          <p className="text-sm text-[#4b5563]">Drag & drop your EPUB file here</p>
          <p className="text-sm text-blue-600">or click to browse</p>
        </button>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#fbfcfe] px-3 py-2.5">
          <div className="text-sm font-medium text-[#374151]">
            {file ? file.name : 'No file selected'}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            {file ? fileSizeLabel : '--'}
            {file ? (
              <span className="inline-flex rounded-full bg-green-100 p-1 text-green-600">
                <Check className="h-3 w-3" />
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-[#111827]">2. Convert to PDF</h3>
        <div className="mt-3 rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Output format
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">PDF</p>
              <p className="text-sm text-[#6b7280]">Reader-friendly printable layout</p>
            </div>
            <button
              type="button"
              disabled={disabled || !file}
              onClick={onConvert}
              className="inline-flex h-9 items-center rounded-lg bg-[#ef3f0a] px-4 text-xs font-semibold text-white hover:bg-[#dc3506] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Convert EPUB
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      <aside className="p-6">
        <h3 className="text-sm font-semibold text-[#111827]">Conversion status</h3>
        <div className="mt-4 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <p className="text-sm font-medium text-[#111827]">{phaseLabel(phase)}</p>
          <div className="mt-3 h-2 rounded-full bg-[#edf1f4]">
            <div
              className="h-2 rounded-full bg-[#ef3f0a] transition-all"
              style={{ width: `${phaseProgress(phase)}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-[#6b7280]">
            {phaseProgress(phase)}%
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
            {phase === 'converting' || phase === 'reading_epub' || phase === 'uploading' ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#ef3f0a]" />
            ) : (
              <FileText className="h-4 w-4 text-[#4b5563]" />
            )}
            Download
          </div>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#ef3f0a] px-4 text-xs font-semibold text-white hover:bg-[#dc3506]"
            >
              Download PDF
            </a>
          ) : (
            <p className="mt-2 text-xs text-[#6b7280]">
              Your download link appears here after conversion succeeds.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-[#6b7280]">
          Files auto-delete after 1 hour. DRM decryption is not supported.
        </p>
      </aside>
    </div>
  );
}
