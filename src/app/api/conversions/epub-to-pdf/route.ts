import { createEpubPdfJob } from '@/lib/epub-pdf/job-store';
import {
  createRemoteJob,
  isRemoteConverterEnabled,
} from '@/lib/epub-pdf/remote';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { errorCode: 'INVALID_FILE', errorMessage: 'Please upload a valid .epub file.' },
      { status: 400 }
    );
  }

  if (isRemoteConverterEnabled()) {
    const remote = await createRemoteJob(file);
    return NextResponse.json(remote.data, { status: remote.status });
  }

  const result = await createEpubPdfJob(file);
  if (!result.ok) {
    return NextResponse.json(
      { errorCode: result.errorCode, errorMessage: result.errorMessage },
      { status: 400 }
    );
  }

  return NextResponse.json({
    jobId: result.jobId,
    status: 'uploading',
  });
}
