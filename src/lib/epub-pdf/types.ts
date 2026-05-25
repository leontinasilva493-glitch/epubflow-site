import type { ConversionFormat } from '@/lib/epub-converter/format-config';

export type ConversionStatus =
  | 'pending'
  | 'uploading'
  | 'reading_epub'
  | 'converting'
  | 'preparing_download'
  | 'success'
  | 'failed';

export type ConversionErrorCode =
  | 'INVALID_FILE'
  | 'FILE_TOO_LARGE'
  | 'CORRUPTED_EPUB'
  | 'DRM_PROTECTED'
  | 'CONVERSION_TIMEOUT'
  | 'CONVERTER_NOT_AVAILABLE'
  | 'CONVERSION_FAILED'
  | 'NOT_FOUND'
  | 'EXPIRED';

export interface ConversionJob {
  id: string;
  status: ConversionStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  inputFilename: string;
  inputSize: number;
  inputPath: string;
  outputPath: string;
  outputFilename: string;
  targetFormat: ConversionFormat;
  errorCode?: ConversionErrorCode;
  errorMessage?: string;
}

export interface ConversionJobPublic {
  id: string;
  targetFormat: ConversionFormat;
  status: ConversionStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  inputFilename: string;
  inputSize: number;
  downloadUrl: string | null;
  errorCode: ConversionErrorCode | null;
  errorMessage: string | null;
}
