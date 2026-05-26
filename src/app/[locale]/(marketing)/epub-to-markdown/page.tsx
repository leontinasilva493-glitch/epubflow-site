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
    title: 'EPUB to Markdown Converter for Obsidian & Notion | EPUBFlow',
    description:
      'EPUB to Markdown conversion is in active rollout. Use EPUBFlow to prepare clean knowledge-ready notes.',
    locale,
    pathname: '/epub-to-markdown',
  });
}

export default function EpubToMarkdownPage() {
  return (
    <div className="bg-gradient-to-b from-[#f9f8f7] via-[#fafafa] to-[#f7f7f7] text-[#111827]">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
          EPUB to Markdown Converter
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[#6b7280] sm:text-lg">
          Markdown conversion is our next differentiation release for Obsidian,
          Notion, and AI workflow users. We are currently polishing heading
          structure, notes, and cleanup quality before full launch.
        </p>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold">Launching soon</h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Need conversion today? You can use EPUB to TXT right now and we will
            announce EPUB to Markdown when quality is ready.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <LocaleLink
              href="/epub-to-txt"
              className="rounded-lg bg-[#ef3f0a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#dc3506]"
            >
              Try EPUB to TXT
            </LocaleLink>
            <LocaleLink
              href="/contact"
              className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f8fafc]"
            >
              Contact support
            </LocaleLink>
          </div>
        </div>
      </section>
    </div>
  );
}
