import { isSupportedFormat } from '@/lib/epub-converter/format-config';
import { createHmac, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

const TOKEN_TTL_SECONDS = 2 * 60 * 60;

function getConverterBaseUrl() {
  return process.env.EPUBFLOW_CONVERTER_API_URL?.replace(/\/+$/, '') || null;
}

function getTokenSecret() {
  return (
    process.env.EPUBFLOW_CONVERTER_UPLOAD_TOKEN_SECRET ||
    process.env.EPUBFLOW_CONVERTER_API_KEY ||
    null
  );
}

function base64url(input: string) {
  return Buffer.from(input, 'utf-8').toString('base64url');
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export async function GET(request: Request) {
  const baseUrl = getConverterBaseUrl();
  const secret = getTokenSecret();
  if (!baseUrl || !secret) {
    return NextResponse.json(
      {
        errorCode: 'DIRECT_UPLOAD_NOT_CONFIGURED',
        errorMessage: 'Direct converter upload is not configured.',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || '';
  if (!isSupportedFormat(format)) {
    return NextResponse.json(
      {
        errorCode: 'INVALID_FORMAT',
        errorMessage: 'Unsupported conversion format.',
      },
      { status: 400 }
    );
  }

  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = base64url(
    JSON.stringify({
      aud: 'epubflow-converter',
      format,
      exp: expiresAt,
      nonce: randomUUID(),
    })
  );
  const token = `${payload}.${sign(payload, secret)}`;

  return NextResponse.json({
    converterBaseUrl: baseUrl,
    uploadUrl: `${baseUrl}/v1/conversions/epub-to-${format}`,
    token,
    expiresAt,
  });
}
