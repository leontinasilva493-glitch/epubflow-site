import type { ConversionFormat } from './format-config';

function getConverterBaseUrl() {
  return process.env.EPUBFLOW_CONVERTER_API_URL?.replace(/\/+$/, '') || null;
}

export async function reportConverterMetric(
  event: string,
  payload: Record<string, unknown>
) {
  const baseUrl = getConverterBaseUrl();
  if (!baseUrl) return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const apiKey = process.env.EPUBFLOW_CONVERTER_API_KEY;
  if (apiKey) headers['x-api-key'] = apiKey;

  try {
    await fetch(`${baseUrl}/v1/metrics`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event,
        source: 'web-api',
        ...payload,
      }),
      cache: 'no-store',
    });
  } catch {}
}

export function normalizeDownloadFailure(
  statusCode: number,
  errorCode?: string | null
) {
  if (errorCode === 'EXPIRED') return 'expired';
  if (errorCode === 'NOT_FOUND') return 'not_found';
  if (statusCode === 404) return 'not_found';
  if (statusCode >= 500) return 'server_error';
  return 'unknown';
}

export function formatForMetrics(value: string | null | undefined): ConversionFormat | 'unknown' {
  if (!value) return 'unknown';
  if (value === 'pdf' || value === 'mobi' || value === 'azw3' || value === 'txt' || value === 'docx') {
    return value;
  }
  return 'unknown';
}
