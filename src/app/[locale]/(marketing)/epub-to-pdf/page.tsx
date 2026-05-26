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
    title: 'EPUB to PDF Converter - Free & Private | EPUBFlow',
    description:
      'Convert EPUB to PDF with clean layout, preserved chapters, and private processing. No signup required.',
    locale,
    pathname: '/epub-to-pdf',
  });
}

export default function EpubToPdfPage() {
  return (
    <EpubConvertPage
      title="EPUB to PDF Converter"
      description="Convert EPUB into reader-friendly PDF with preserved structure, headings, and typography."
      format="pdf"
      apiEndpoint="/api/conversions/epub-to-pdf"
      formatLabel="PDF"
      formatDescription="Reader-friendly printable layout"
    />
  );
}
