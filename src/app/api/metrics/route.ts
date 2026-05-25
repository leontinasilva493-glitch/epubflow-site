import { NextResponse } from 'next/server';

const EVENT_ALLOWLIST = new Set([
  'upload_started',
  'upload_rejected',
  'convert_started',
  'convert_succeeded',
  'convert_failed',
  'download_started',
  'download_failed',
]);

function getConverterBaseUrl() {
  return process.env.EPUBFLOW_CONVERTER_API_URL?.replace(/\/+$/, '') || null;
}

function buildHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const apiKey = process.env.EPUBFLOW_CONVERTER_API_KEY;
  if (apiKey) headers['x-api-key'] = apiKey;
  return headers;
}

export async function POST(request: Request) {
  const baseUrl = getConverterBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        errorCode: 'CONVERTER_NOT_CONFIGURED',
        errorMessage: 'Converter metrics endpoint is not configured.',
      },
      { status: 503 }
    );
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { errorCode: 'INVALID_JSON', errorMessage: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const event = String(payload.event || '');
  if (!EVENT_ALLOWLIST.has(event)) {
    return NextResponse.json(
      { errorCode: 'INVALID_EVENT', errorMessage: 'Unsupported event type.' },
      { status: 400 }
    );
  }

  const response = await fetch(`${baseUrl}/v1/metrics`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!response.ok) {
    const fallback = {
      errorCode: 'METRICS_FORWARD_FAILED',
      errorMessage: 'Failed to forward metrics event to converter service.',
    };
    let data = fallback;
    try {
      data = (await response.json()) as typeof fallback;
    } catch {}
    return NextResponse.json(data, { status: response.status });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET(request: Request) {
  const baseUrl = getConverterBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { errorCode: 'CONVERTER_NOT_CONFIGURED', errorMessage: 'Converter metrics endpoint is not configured.' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') || '7';
  const response = await fetch(`${baseUrl}/v1/metrics?days=${encodeURIComponent(days)}`, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
