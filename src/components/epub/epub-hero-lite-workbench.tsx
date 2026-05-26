'use client';

import { LocaleLink } from '@/i18n/navigation';
import {
  type ConversionFormat,
  getFormatConfig,
} from '@/lib/epub-converter/format-config';
import { Check, Loader2, Upload, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  errorCode?: string | null;
  errorMessage: string | null;
}

interface EpubHeroLiteWorkbenchProps {
  format: ConversionFormat;
  apiEndpoint: string;
  formatLabel: string;
}

const MAX_MB = 50;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export function EpubHeroLiteWorkbench({
  format,
  apiEndpoint,
  formatLabel,
}: EpubHeroLiteWorkbenchProps) {
  const t = useTranslations('ConvertWorkbench');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UiPhase>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileSizeLabel = useMemo(() => {
    if (!file) return '';
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [file]);

  const getPhaseLabel = (currentPhase: UiPhase) => {
    switch (currentPhase) {
      case 'uploading':
        return t('status.uploading');
      case 'reading_epub':
        return t('status.reading');
      case 'converting':
        return t('status.converting');
      case 'preparing_download':
        return t('status.preparing');
      case 'success':
        return t('status.success');
      case 'failed':
        return t('status.failed');
      default:
        return t('status.ready');
    }
  };

  const getPhaseProgress = (currentPhase: UiPhase) => {
    switch (currentPhase) {
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
  };

  const trackEvent = async (
    event: string,
    payload: Record<string, unknown> = {}
  ) => {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          source: 'web',
          targetFormat: format,
          ...payload,
        }),
      });
    } catch {}
  };

  const resetFlow = () => {
    setPhase('idle');
    setDownloadUrl(null);
    setJobId(null);
    setError(null);
    setErrorCode(null);
  };

  useEffect(() => {
    if (!jobId || phase === 'success' || phase === 'failed') return;
    const timer = setInterval(async () => {
      const response = await fetch(`/api/conversions/${jobId}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        setPhase('failed');
        setErrorCode('STATUS_CHECK_FAILED');
        setError(t('errors.statusCheck'));
        clearInterval(timer);
        return;
      }
      const data = (await response.json()) as JobResponse;
      setPhase(data.status);
      setDownloadUrl(data.downloadUrl);
      if (data.status === 'failed') {
        setErrorCode(data.errorCode || 'CONVERSION_FAILED');
        setError(data.errorMessage || t('errors.conversionFailed'));
        clearInterval(timer);
      }
      if (data.status === 'success') {
        clearInterval(timer);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [jobId, phase, t]);

  const onChooseFile = () => fileInputRef.current?.click();

  const onFileSelected = (nextFile: File | null) => {
    resetFlow();
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!nextFile.name.toLowerCase().endsWith('.epub')) {
      setFile(null);
      setError(t('errors.invalidType'));
      setErrorCode('INVALID_FILE');
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setFile(null);
      setError(t('errors.tooLarge', { max: MAX_MB }));
      setErrorCode('FILE_TOO_LARGE');
      return;
    }
    setFile(nextFile);
  };

  const onConvert = async () => {
    if (!file) {
      setError(t('errors.missingFile'));
      setErrorCode('INVALID_FILE');
      return;
    }

    setError(null);
    setErrorCode(null);
    setPhase('uploading');
    void trackEvent('upload_started', {
      file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
    });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    });
    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      setPhase('failed');
      setErrorCode(String(data.errorCode || 'CONVERSION_FAILED'));
      setError(String(data.errorMessage || t('errors.createJob')));
      return;
    }
    setJobId(String(data.jobId));
  };

  const mapDownloadErrorType = (status: number | null) => {
    if (status === 404) return 'not_found';
    if (status === 410) return 'expired';
    if (status && status >= 500) return 'server_error';
    return 'network_error';
  };

  const onDownload = async () => {
    if (!downloadUrl) return;
    try {
      await trackEvent('download_started', { job_id: jobId });
      const response = await fetch(downloadUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = file
        ? `${file.name.replace(/\.[^.]+$/, '')}.${getFormatConfig(format).extension}`
        : `converted.${getFormatConfig(format).extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      let status: number | null = null;
      if (err instanceof Error && err.message.startsWith('HTTP_')) {
        status = Number(err.message.replace('HTTP_', ''));
      }
      await trackEvent('download_failed', {
        job_id: jobId,
        status,
        error_type: mapDownloadErrorType(status),
      });
      setErrorCode('DOWNLOAD_FAILED');
      setError(t('errors.downloadFailed'));
    }
  };

  return (
    <div className="space-y-3 p-4 sm:p-5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".epub,application/epub+zip"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={onChooseFile}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onChooseFile();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
          const droppedFile = event.dataTransfer.files?.[0] ?? null;
          onFileSelected(droppedFile);
        }}
        className={[
          'flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed text-center transition',
          isDragging
            ? 'border-[#ef3f0a] bg-[#fff4ef]'
            : 'border-[#d1d5db] bg-white hover:bg-[#fafafa]',
        ].join(' ')}
      >
        <Upload className="mb-1.5 h-5 w-5 text-[#4b5563]" />
        <p className="text-sm text-[#4b5563]">{t('dropzone.title')}</p>
        <p className="text-sm text-blue-600">{t('dropzone.browse')}</p>
        <p className="mt-1 text-xs text-[#9ca3af]">{t('dropzone.maxSize')}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#fbfcfe] px-3 py-2.5">
        <div className="text-sm font-medium text-[#374151]">
          {file ? file.name : t('file.none')}
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

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            {t('status.title')}
          </p>
          <p className="mt-1 text-sm font-medium text-[#111827]">
            {getPhaseLabel(phase)}
          </p>
          <div className="mt-2 h-2 rounded-full bg-[#edf1f4]">
            <div
              className="h-2 rounded-full bg-[#ef3f0a] transition-all"
              style={{ width: `${getPhaseProgress(phase)}%` }}
            />
          </div>
        </div>

        {downloadUrl ? (
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ef3f0a] px-4 text-xs font-semibold text-white hover:bg-[#dc3506]"
          >
            {t('download.buttonPrefix')} {formatLabel}
          </button>
        ) : (
          <button
            type="button"
            disabled={!file || (phase !== 'idle' && phase !== 'failed' && phase !== 'success')}
            onClick={onConvert}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ef3f0a] px-4 text-xs font-semibold text-white hover:bg-[#dc3506] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('convertButton')}
          </button>
        )}
      </div>

      <div className="text-[11px] text-[#6b7280] sm:text-xs">
        {t('privacy.title')}{' '}
        <LocaleLink href="/privacy" className="text-[#ef3f0a] hover:underline">
          {t('privacy.privacyPolicy')}
        </LocaleLink>{' '}
        /{' '}
        <LocaleLink
          href="/data-retention"
          className="text-[#ef3f0a] hover:underline"
        >
          {t('privacy.dataRetention')}
        </LocaleLink>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          {errorCode ? (
            <p className="mt-1.5 text-xs text-red-600/90">
              {t('errors.errorCode', { code: errorCode })}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
