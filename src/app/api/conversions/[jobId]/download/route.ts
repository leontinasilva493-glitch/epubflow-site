import {
  formatForMetrics,
  normalizeDownloadFailure,
  reportConverterMetric,
} from '@/lib/epub-converter/metrics';
import { getFormatConfig } from '@/lib/epub-converter/format-config';
import { getErrorMessage, getJobFilePath } from '@/lib/epub-pdf/job-store';
import {
  getRemoteDownload,
  isRemoteConverterEnabled,
} from '@/lib/epub-pdf/remote';
import { promises as fs } from 'node:fs';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (isRemoteConverterEnabled()) {
    const remote = await getRemoteDownload(jobId);
    if (!remote.ok) {
      const data = await remote.json();
      await reportConverterMetric('download_failed', {
        job_id: jobId,
        targetFormat: formatForMetrics(
          typeof data?.targetFormat === 'string' ? data.targetFormat : null
        ),
        error_type: normalizeDownloadFailure(
          remote.status,
          typeof data?.errorCode === 'string' ? data.errorCode : null
        ),
      });
      return NextResponse.json(data, { status: remote.status });
    }
    return new NextResponse(remote.body, {
      status: remote.status,
      headers: {
        'Content-Type': remote.headers.get('content-type') || 'application/pdf',
        'Content-Disposition':
          remote.headers.get('content-disposition') || 'attachment',
        'Cache-Control': 'no-store',
      },
    });
  }

  const result = await getJobFilePath(jobId);
  if (!result.ok) {
    const status = result.code === 'NOT_FOUND' ? 404 : 400;
    await reportConverterMetric('download_failed', {
      job_id: jobId,
      targetFormat: 'unknown',
      error_type: normalizeDownloadFailure(status, result.code),
    });
    return NextResponse.json(
      { errorCode: result.code, errorMessage: getErrorMessage(result.code) },
      { status }
    );
  }

  const fileBuffer = await fs.readFile(result.outputPath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': getFormatConfig(result.targetFormat).mime,
      'Content-Disposition': `attachment; filename="${result.outputFilename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
