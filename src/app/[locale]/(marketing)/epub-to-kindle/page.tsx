import { EpubKindleWorkbench } from '@/components/epub/epub-kindle-workbench';
import { LocaleLink } from '@/i18n/navigation';
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
    title: 'EPUB to Kindle Converter (AZW3 & MOBI) | EPUBFlow',
    description:
      'Convert EPUB for Kindle in AZW3 or MOBI format. Optimized for modern and legacy Kindle devices.',
    locale,
    pathname: '/epub-to-kindle',
  });
}

const otherFormatLinks = [
  { href: '/epub-to-pdf', label: 'EPUB to PDF' },
  { href: '/epub-to-markdown', label: 'EPUB to Markdown' },
  { href: '/epub-to-txt', label: 'EPUB to TXT' },
  { href: '/epub-to-docx', label: 'EPUB to DOCX' },
];

export default function EpubToKindlePage() {
  return (
    <div className="bg-gradient-to-b from-[#f9f8f7] via-[#fafafa] to-[#f7f7f7] text-[#111827]">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
            EPUB to Kindle Converter
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6b7280] sm:text-lg">
            Convert EPUB for Kindle and choose AZW3 or MOBI based on your device.
            AZW3 is recommended for most modern Kindle models.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
          <EpubKindleWorkbench />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-[#111827]">Other formats</h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            Need another target format? Explore the rest of EPUBFlow converters.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherFormatLinks.map((item) => (
              <LocaleLink
                key={item.href}
                href={item.href}
                className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f8fafc]"
              >
                {item.label}
              </LocaleLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
