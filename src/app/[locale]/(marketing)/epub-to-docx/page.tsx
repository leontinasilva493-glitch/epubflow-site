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
    title: 'EPUB to Word (DOCX) Converter | EPUBFlow',
    description:
      'Convert EPUB to DOCX for editing in Microsoft Word and document workflows. Private and simple conversion.',
    locale,
    pathname: '/epub-to-docx',
  });
}

export default function EpubToDocxPage() {
  return (
    <EpubConvertPage
      title="EPUB to Word Converter"
      description="Convert EPUB into DOCX for editing, annotation, and document collaboration in Microsoft Word."
      format="docx"
      apiEndpoint="/api/conversions/epub-to-docx"
      formatLabel="Word (DOCX)"
      formatDescription="Editable Word document output"
    />
  );
}
