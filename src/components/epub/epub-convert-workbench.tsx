'use client';

import { LocaleLink } from '@/i18n/navigation';
import {
  type ConversionFormat,
  getFormatConfig,
} from '@/lib/epub-converter/format-config';
import { Check, FileText, Loader2, Upload, XCircle } from 'lucide-react';
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

interface EpubConvertWorkbenchProps {
  format: ConversionFormat;
  apiEndpoint: string;
  formatLabel: string;
  formatDescription: string;
  compact?: boolean;
}

const MAX_MB = 50;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = Math.ceil((5 * 60 * 1000) / POLL_INTERVAL_MS);

export function EpubConvertWorkbench({
  format,
  apiEndpoint,
  formatLabel,
  formatDescription,
  compact = false,
}: EpubConvertWorkbenchProps) {
  const t = useTranslations('ConvertWorkbench');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UiPhase>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pollAttemptsRef = useRef(0);

  const fileSizeLabel = useMemo(() => {
    if (!file) return '';
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [file]);

  const supportMailHref = useMemo(() => {
    const subject = jobId
      ? `Conversion Issue - ${jobId}`
      : 'Conversion Issue - EPUBFlow';
    return `mailto:support@epubflow.com?subject=${encodeURIComponent(subject)}`;
  }, [jobId]);

  const disabled = phase !== 'idle' && phase !== 'failed' && phase !== 'success';

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
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          source: 'web',
          targetFormat: format,
          ...payload,
        }),
      });
      if (!response.ok) {
        console.warn(`[metrics] ${event} failed`, response.status);
      }
    } catch (err) {
      console.warn(`[metrics] ${event} failed`, err);
    }
  };

  const resetFlow = () => {
    setPhase('idle');
    setDownloadUrl(null);
    setJobId(null);
    setError(null);
    setErrorCode(null);
    pollAttemptsRef.current = 0;
  };

  useEffect(() => {
    if (!jobId || phase === 'success' || phase === 'failed') return;
    pollAttemptsRef.current = 0;
    const timer = setInterval(async () => {
      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
        setPhase('failed');
        setErrorCode('CONVERSION_TIMEOUT');
        setError(t('errors.timeout'));
        clearInterval(timer);
        return;
      }
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
    }, POLL_INTERVAL_MS);
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

  const handleDownload = async () => {
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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    onFileSelected(droppedFile);
  };

  return (
    <div className="grid xl:grid-cols-[1fr_320px]">
      <div
        className={[
          'border-b border-r border-[#eef0f3] xl:border-b-0',
          compact ? 'p-4' : 'p-5',
        ].join(' ')}
      >
        <h3 className="text-sm font-semibold text-[#111827]">{t('step1')}</h3>
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
          onDrop={handleDrop}
          className={[
            'mt-3 flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed text-center transition',
            compact ? 'h-24' : 'h-32',
            isDragging
              ? 'border-[#ef3f0a] bg-[#fff4ef]'
              : 'border-[#d1d5db] bg-white hover:bg-[#fafafa]',
          ].join(' ')}
        >
          <Upload className="mb-2 h-5 w-5 text-[#4b5563]" />
          <p className="text-sm text-[#4b5563]">{t('dropzone.title')}</p>
          <p className="text-sm text-blue-600">{t('dropzone.browse')}</p>
          <p className="mt-1 text-xs text-[#9ca3af]">{t('dropzone.maxSize')}</p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#fbfcfe] px-3 py-2.5">
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

        {compact ? (
          <div className="mt-3 rounded-xl border border-[#e5e7eb] bg-[#fffdfb] px-3 py-2.5 text-[11px] text-[#6b7280] sm:text-xs">
            <span className="font-semibold text-[#111827]">{t('privacy.title')}</span>{' '}
            {t('privacy.description')}{' '}
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
        ) : (
          <div className="mt-4 rounded-xl border border-[#e5e7eb] bg-[#fffdfb] p-3.5">
            <p className="text-sm font-semibold text-[#111827]">
              {t('privacy.title')}
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-[#6b7280] sm:text-xs">
              {t('privacy.description')}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-1 text-[11px] text-[#6b7280] sm:text-xs">
              {t('privacy.learnMore')}{' '}
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
            <div className="mt-1 text-[11px] text-[#6b7280] sm:text-xs">
              {t('privacy.issues')}{' '}
              <a href={supportMailHref} className="text-[#ef3f0a] hover:underline">
                {t('privacy.contactSupport')}
              </a>
            </div>
          </div>
        )}

        <h3 className="mt-6 text-sm font-semibold text-[#111827]">
          {t('step2Prefix')} {formatLabel}
        </h3>
        <div className="mt-3 rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            {t('outputFormat')}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">{formatLabel}</p>
              <p className="text-sm text-[#6b7280]">{formatDescription}</p>
            </div>
            <button
              type="button"
              disabled={disabled || !file}
              onClick={onConvert}
              className="inline-flex h-9 items-center rounded-lg bg-[#ef3f0a] px-4 text-xs font-semibold text-white hover:bg-[#dc3506] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('convertButton')}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            {errorCode ? (
              <p className="mt-2 text-xs text-red-600/90">
                {t('errors.errorCode', { code: errorCode })}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetFlow}
                className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                {t('errors.retry')}
              </button>
              <a
                href={supportMailHref}
                className="inline-flex h-8 items-center rounded-lg bg-[#ef3f0a] px-3 text-xs font-semibold text-white hover:bg-[#dc3506]"
              >
                {t('privacy.contactSupport')}
              </a>
            </div>
          </div>
        ) : null}
      </div>

      <aside className={compact ? 'p-4' : 'p-6'}>
        <h3 className="text-sm font-semibold text-[#111827]">
          {t('status.title')}
        </h3>
        <div className="mt-4 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <p className="text-sm font-medium text-[#111827]">
            {getPhaseLabel(phase)}
          </p>
          <div className="mt-3 h-2 rounded-full bg-[#edf1f4]">
            <div
              className="h-2 rounded-full bg-[#ef3f0a] transition-all"
              style={{ width: `${getPhaseProgress(phase)}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-[#6b7280]">
            {getPhaseProgress(phase)}%
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
            {phase === 'converting' ||
            phase === 'reading_epub' ||
            phase === 'uploading' ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#ef3f0a]" />
            ) : (
              <FileText className="h-4 w-4 text-[#4b5563]" />
            )}
            {t('download.title')}
          </div>
          {downloadUrl ? (
            <button
              type="button"
              onClick={handleDownload}
              className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#ef3f0a] px-4 text-xs font-semibold text-white hover:bg-[#dc3506]"
            >
              {t('download.buttonPrefix')} {formatLabel}
            </button>
          ) : (
            <p className="mt-2 text-xs text-[#6b7280]">
              {t('download.placeholder')}
            </p>
          )}
        </div>

        <p className="mt-3 text-[11px] leading-5 text-[#6b7280] sm:text-xs">
          {t('download.footnote')}
        </p>
      </aside>
    </div>
  );
}
