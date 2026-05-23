import { getPublicJob } from '@/lib/epub-pdf/job-store';
import { getRemoteJob, isRemoteConverterEnabled } from '@/lib/epub-pdf/remote';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (isRemoteConverterEnabled()) {
    const remote = await getRemoteJob(jobId);
    if (remote.status >= 200 && remote.status < 300) {
      const normalized = remote.data as Record<string, unknown>;
      return NextResponse.json(
        {
          ...normalized,
          downloadUrl:
            normalized.status === 'success'
              ? `/api/conversions/${jobId}/download`
              : null,
        },
        { status: remote.status }
      );
    }
    return NextResponse.json(remote.data, { status: remote.status });
  }

  const job = await getPublicJob(jobId);
  if (!job) {
    return NextResponse.json(
      { errorCode: 'NOT_FOUND', errorMessage: 'Conversion job not found.' },
      { status: 404 }
    );
  }
  return NextResponse.json(job);
}
