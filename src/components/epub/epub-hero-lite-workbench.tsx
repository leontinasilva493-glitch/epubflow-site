'use client';

import { LocaleLink } from '@/i18n/navigation';
import {
  type ConversionFormat,
  getFormatConfig,
} from '@/lib/epub-converter/format-config';
import {
  createDirectConversionJob,
  fetchDirectDownload,
  getDirectConversionJob,
  isDirectConverterEnabled,
} from '@/lib/epub-converter/direct-client';
import { Check, FileText, Smartphone, Upload, X, XCircle } from 'lucide-react';
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
  formatOptions?: Array<{
    key: string;
    label: string;
    description: string;
    comingSoon?: boolean;
  }>;
  selectedFormatKey?: string;
  onFormatChange?: (key: string) => void;
  soonLabel?: string;
  selectorTitle?: string;
  selectorDescription?: string;
}

const MAX_MB = 50;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = Math.ceil((5 * 60 * 1000) / POLL_INTERVAL_MS);

export function EpubHeroLiteWorkbench({
  format,
  apiEndpoint,
  formatLabel,
  formatOptions,
  selectedFormatKey,
  onFormatChange,
  soonLabel,
  selectorTitle,
  selectorDescription,
}: EpubHeroLiteWorkbenchProps) {
  const t = useTranslations('ConvertWorkbench');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UiPhase>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [converterBaseUrl, setConverterBaseUrl] = useState<string | null>(null);
  const [converterAccessToken, setConverterAccessToken] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pollAttemptsRef = useRef(0);

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
    setConverterBaseUrl(null);
    setConverterAccessToken(null);
    setJobId(null);
    setError(null);
    setErrorCode(null);
    pollAttemptsRef.current = 0;
  };

  const clearSelectedFile = () => {
    resetFlow();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canChangeFormat =
    phase === 'idle' || phase === 'failed' || phase === 'success';

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
      let directStatus: Awaited<ReturnType<typeof getDirectConversionJob>> | null =
        null;
      let response: Response | Awaited<ReturnType<typeof getDirectConversionJob>>;
      try {
        directStatus =
          converterBaseUrl && converterAccessToken
            ? await getDirectConversionJob(
                jobId,
                converterBaseUrl,
                converterAccessToken
              )
            : null;
        response =
          directStatus ??
          (await fetch(`/api/conversions/${jobId}`, {
            cache: 'no-store',
          }));
      } catch {
        setPhase('failed');
        setErrorCode('STATUS_CHECK_FAILED');
        setError(t('errors.statusCheck'));
        clearInterval(timer);
        return;
      }
      if (!response.ok) {
        setPhase('failed');
        setErrorCode('STATUS_CHECK_FAILED');
        setError(t('errors.statusCheck'));
        clearInterval(timer);
        return;
      }
      const data = directStatus
        ? (directStatus.data as unknown as JobResponse)
        : ((await (response as Response).json()) as JobResponse);
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
  }, [converterAccessToken, converterBaseUrl, jobId, phase, t]);

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

    try {
      let data: Record<string, unknown>;
      if (isDirectConverterEnabled()) {
        const direct = await createDirectConversionJob(file, format);
        data = direct.data;
        if (!direct.ok) {
          setPhase('failed');
          setErrorCode(String(data.errorCode || 'CONVERSION_FAILED'));
          setError(String(data.errorMessage || t('errors.createJob')));
          return;
        }
        setConverterBaseUrl(direct.converterBaseUrl);
        setConverterAccessToken(direct.accessToken);
      } else {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        });
        data = (await response.json()) as Record<string, unknown>;
        if (!response.ok) {
          setPhase('failed');
          setErrorCode(String(data.errorCode || 'CONVERSION_FAILED'));
          setError(String(data.errorMessage || t('errors.createJob')));
          return;
        }
      }
      setJobId(String(data.jobId));
    } catch {
      setPhase('failed');
      setErrorCode('CONVERSION_FAILED');
      setError(t('errors.createJob'));
    }
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
      const response =
        converterBaseUrl && converterAccessToken
          ? await fetchDirectDownload(
              downloadUrl,
              converterBaseUrl,
              converterAccessToken
            )
          : await fetch(downloadUrl, { cache: 'no-store' });
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
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
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
        aria-label={t('dropzone.title')}
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
          'relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed px-6 py-10 text-center transition sm:min-h-64',
          isDragging
            ? 'border-[#ef3f0a] bg-[#fff4ef]'
            : 'border-[#bbb4ad] bg-[linear-gradient(180deg,#fffdfb_0%,#f8fafc_100%)] hover:border-[#ef3f0a]/60 hover:bg-[#fffaf7]',
        ].join(' ')}
      >
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ece5df] bg-white text-[#111827] shadow-[0_12px_28px_rgba(17,24,39,0.08)]">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-[#111827]">
          {t('dropzone.title')}
        </p>
        <p className="mt-1.5 text-base font-medium text-[#ef3f0a]">
          {t('dropzone.browse')}
        </p>
        <p className="mt-2.5 text-sm text-[#8a8179]">{t('dropzone.maxSize')}</p>
      </div>

      {file ? (
        <div className="rounded-[22px] border border-[#e7ddd7] bg-[#fffaf7] p-4 text-left shadow-[0_14px_34px_rgba(17,24,39,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#ef3f0a] shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#111827]">
                {file.name}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                <span>{fileSizeLabel}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                  <Check className="h-3 w-3" />
                  {t('status.ready')}
                </span>
              </div>
            </div>
            <button
              type="button"
              aria-label={t('file.none')}
              onClick={clearSelectedFile}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7ddd7] bg-white text-[#6b7280] transition hover:border-[#ef3f0a]/40 hover:text-[#111827]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {formatOptions?.length ? (
            <div className="mt-4 border-t border-[#eadfd8] pt-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {selectorTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                    {selectorDescription}
                  </p>
                </div>
                <span className="hidden items-center gap-1 text-xs font-semibold text-[#6b7280] sm:inline-flex">
                  <Smartphone className="h-3.5 w-3.5" />
                  {formatLabel}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {formatOptions.map((option) => {
                  const isActive = option.key === selectedFormatKey;
                  const isDisabled = option.comingSoon || !canChangeFormat;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        resetFlow();
                        onFormatChange?.(option.key);
                      }}
                      className={[
                        'min-h-16 rounded-2xl border px-3 py-2 text-left transition',
                        isActive
                          ? 'border-[#ef3f0a] bg-[#ef3f0a] text-white shadow-[0_10px_24px_rgba(239,63,10,0.24)]'
                          : 'border-[#e5e0dc] bg-white text-[#111827] hover:border-[#ef3f0a]/45 hover:bg-[#fff7f2]',
                        isDisabled
                          ? 'cursor-not-allowed opacity-55 hover:border-[#e5e0dc] hover:bg-white'
                          : '',
                      ].join(' ')}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>
                        {option.comingSoon ? (
                          <span
                            className={[
                              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#fff1eb] text-[#ef3f0a]',
                            ].join(' ')}
                          >
                            {soonLabel}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-4 opacity-75">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 rounded-[22px] border border-[#e7eaee] bg-[#fbfcfe] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            {t('status.title')}
          </p>
          <p className="mt-1 text-sm font-medium text-[#111827]">
            {getPhaseLabel(phase)}
          </p>
          <div
            role="progressbar"
            aria-valuenow={getPhaseProgress(phase)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-2 rounded-full bg-[#edf1f4]"
          >
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
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ef3f0a] px-5 text-sm font-semibold text-white hover:bg-[#dc3506]"
          >
            {t('download.buttonPrefix')} {formatLabel}
          </button>
        ) : (
          <button
            type="button"
            disabled={
              !file || (phase !== 'idle' && phase !== 'failed' && phase !== 'success')
            }
            onClick={onConvert}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ef3f0a] px-5 text-sm font-semibold text-white hover:bg-[#dc3506] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('convertButton')}
          </button>
        )}
      </div>

      <div className="text-[11px] text-[#6b7280] sm:text-xs">
        <span className="font-medium">{t('privacy.title')}</span>{' '}
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetFlow}
              className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              {t('errors.retry')}
            </button>
            <a
              href="mailto:support@epubflow.com?subject=Conversion%20Issue%20-%20EPUBFlow"
              className="inline-flex h-8 items-center rounded-lg bg-[#ef3f0a] px-3 text-xs font-semibold text-white hover:bg-[#dc3506]"
            >
              {t('privacy.contactSupport')}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
