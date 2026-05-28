import type { ConversionFormat } from './format-config';

interface DirectUploadTokenResponse {
  converterBaseUrl: string;
  uploadUrl: string;
  token: string;
  expiresAt: number;
}

function getPublicConverterBaseUrl() {
  return process.env.NEXT_PUBLIC_EPUBFLOW_CONVERTER_API_URL?.replace(/\/+$/, '');
}

function resolveConverterUrl(baseUrl: string, pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${baseUrl}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function isDirectConverterEnabled() {
  return Boolean(getPublicConverterBaseUrl());
}

export async function createDirectConversionJob(
  file: File,
  format: ConversionFormat
) {
  const tokenResponse = await fetch(
    `/api/conversions/upload-token?format=${encodeURIComponent(format)}`,
    { cache: 'no-store' }
  );
  if (!tokenResponse.ok) {
    throw new Error(`DIRECT_UPLOAD_TOKEN_${tokenResponse.status}`);
  }
  const tokenData = (await tokenResponse.json()) as DirectUploadTokenResponse;

  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(tokenData.uploadUrl, {
    method: 'POST',
    headers: {
      'x-upload-token': tokenData.token,
    },
    body: formData,
  });
  const data = (await response.json()) as Record<string, unknown>;
  return {
    ok: response.ok,
    status: response.status,
    data,
    accessToken: tokenData.token,
    converterBaseUrl: tokenData.converterBaseUrl,
  };
}

export async function getDirectConversionJob(
  jobId: string,
  converterBaseUrl: string,
  accessToken: string
) {
  const response = await fetch(
    resolveConverterUrl(converterBaseUrl, `/v1/conversions/${jobId}`),
    {
      headers: {
        'x-upload-token': accessToken,
      },
      cache: 'no-store',
    }
  );
  const data = (await response.json()) as Record<string, unknown>;
  return { ok: response.ok, status: response.status, data };
}

export async function fetchDirectDownload(
  downloadUrl: string,
  converterBaseUrl: string,
  accessToken: string
) {
  return fetch(resolveConverterUrl(converterBaseUrl, downloadUrl), {
    headers: {
      'x-upload-token': accessToken,
    },
    cache: 'no-store',
  });
}
