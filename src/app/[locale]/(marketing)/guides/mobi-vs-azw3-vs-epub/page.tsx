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
    title: 'MOBI vs AZW3 vs EPUB - Which Format to Use? | EPUBFlow',
    description:
      'Learn the differences between MOBI, AZW3, and EPUB and choose the best format for your Kindle reading workflow.',
    locale,
    pathname: '/guides/mobi-vs-azw3-vs-epub',
  });
}

export default function GuideMobiVsAzw3VsEpubPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        MOBI vs AZW3 vs EPUB
      </h1>
      <p className="mt-4 text-base leading-7 text-[#6b7280]">
        EPUB is the standard source format. AZW3 is usually the best output for
        modern Kindle devices. MOBI is mainly for older Kindle compatibility.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Quick recommendations</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-[#374151]">
        <li>Use AZW3 for most Kindle e-readers and Kindle apps.</li>
        <li>Use MOBI only if your device/app has legacy compatibility needs.</li>
        <li>Keep original EPUB as your source archive format.</li>
      </ul>

      <div className="mt-10 rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h3 className="text-lg font-semibold">Try it now</h3>
        <p className="mt-2 text-sm text-[#6b7280]">
          Convert your EPUB to Kindle format in one click.
        </p>
        <div className="mt-4 flex gap-2">
          <LocaleLink
            href="/epub-to-kindle"
            className="rounded-lg bg-[#ef3f0a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#dc3506]"
          >
            Open EPUB to Kindle
          </LocaleLink>
          <LocaleLink
            href="/epub-to-pdf"
            className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f8fafc]"
          >
            Open EPUB to PDF
          </LocaleLink>
        </div>
      </div>
    </article>
  );
}
