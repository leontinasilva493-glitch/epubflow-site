import { EpubConvertPage } from '@/components/epub/epub-convert-page';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  return constructMetadata({
    title: 'EPUB to TXT Converter - Extract Clean Text | EPUBFlow',
    description:
      'Convert EPUB to TXT for lightweight reading and text extraction. Fast, private, and no signup required.',
    locale,
    pathname: '/epub-to-txt',
  });
}

export default function EpubToTxtPage() {
  return (
    <EpubConvertPage
      title="EPUB to TXT Converter"
      description="Extract clean plain text from EPUB files for quick reading, drafting, and lightweight processing."
      format="txt"
      apiEndpoint="/api/conversions/epub-to-txt"
      formatLabel="TXT"
      formatDescription="Plain text output for lightweight use"
    />
  );
}
