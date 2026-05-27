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
    title: 'Best eBook Format for Kindle | EPUBFlow',
    description:
      'Find the best eBook format for Kindle and when to choose AZW3, MOBI, PDF, or EPUB source files.',
    locale,
    pathname: '/guides/best-ebook-format-for-kindle',
  });
}

export default function GuideBestEbookFormatForKindlePage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Best eBook Format for Kindle
      </h1>
      <p className="mt-4 text-base leading-7 text-[#6b7280]">
        For most users, AZW3 is the best balance of layout support and Kindle
        compatibility. Keep EPUB as your source, convert to AZW3 for reading,
        and use PDF only when fixed print layout is required.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Format selection checklist</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-[#374151]">
        <li>Kindle device/app: AZW3 first, MOBI fallback.</li>
        <li>Print/export workflow: use PDF.</li>
        <li>Editing workflow: use DOCX.</li>
        <li>Knowledge workflow: use Markdown or TXT.</li>
      </ul>

      <div className="mt-10 rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h3 className="text-lg font-semibold">Start converting</h3>
        <p className="mt-2 text-sm text-[#6b7280]">
          Use EPUBFlow converters to choose the format that fits your reading goal.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LocaleLink
            href="/epub-to-kindle"
            className="rounded-lg bg-[#ef3f0a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#dc3506]"
          >
            EPUB to Kindle
          </LocaleLink>
          <LocaleLink
            href="/epub-to-docx"
            className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f8fafc]"
          >
            EPUB to DOCX
          </LocaleLink>
        </div>
      </div>
    </article>
  );
}
