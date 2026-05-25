import type { ConversionJobPublic } from './types';
import { type ConversionFormat, isSupportedFormat } from '@/lib/epub-converter/format-config';

function getConverterBaseUrl() {
  return process.env.EPUBFLOW_CONVERTER_API_URL?.replace(/\/+$/, '') || null;
}

function buildHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra);
  const apiKey = process.env.EPUBFLOW_CONVERTER_API_KEY;
  if (apiKey) headers.set('x-api-key', apiKey);
  return headers;
}

export function isRemoteConverterEnabled() {
  return Boolean(getConverterBaseUrl());
}

export async function createRemoteJob(file: File, format: ConversionFormat = 'pdf') {
  const baseUrl = getConverterBaseUrl();
  if (!baseUrl) throw new Error('Remote converter is not configured');
  if (!isSupportedFormat(format)) throw new Error('Unsupported conversion format');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/v1/conversions/epub-to-${format}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: formData,
    cache: 'no-store',
  });
  const data = await response.json();
  return { status: response.status, data };
}

export async function getRemoteJob(jobId: string) {
  const baseUrl = getConverterBaseUrl();
  if (!baseUrl) throw new Error('Remote converter is not configured');
  const response = await fetch(`${baseUrl}/v1/conversions/${jobId}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  });
  const data = (await response.json()) as ConversionJobPublic | {
    errorCode?: string;
    errorMessage?: string;
  };
  return { status: response.status, data };
}

export async function getRemoteDownload(jobId: string) {
  const baseUrl = getConverterBaseUrl();
  if (!baseUrl) throw new Error('Remote converter is not configured');
  const response = await fetch(`${baseUrl}/v1/conversions/${jobId}/download`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  });
  return response;
}
