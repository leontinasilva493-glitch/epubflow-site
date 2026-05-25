export type ConversionFormat = 'pdf' | 'mobi' | 'azw3' | 'txt' | 'docx';

export interface FormatConfigItem {
  extension: ConversionFormat;
  mime: string;
  label: string;
}

export const FORMAT_CONFIG: Record<ConversionFormat, FormatConfigItem> = {
  pdf: {
    extension: 'pdf',
    mime: 'application/pdf',
    label: 'PDF',
  },
  mobi: {
    extension: 'mobi',
    mime: 'application/x-mobipocket-ebook',
    label: 'Kindle (MOBI)',
  },
  azw3: {
    extension: 'azw3',
    mime: 'application/vnd.amazon.mobi8-ebook',
    label: 'Kindle (AZW3)',
  },
  txt: {
    extension: 'txt',
    mime: 'text/plain; charset=utf-8',
    label: 'Plain Text',
  },
  docx: {
    extension: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Word (DOCX)',
  },
};

export function isSupportedFormat(value: string): value is ConversionFormat {
  return value in FORMAT_CONFIG;
}

export function getFormatConfig(format: ConversionFormat): FormatConfigItem {
  return FORMAT_CONFIG[format];
}
