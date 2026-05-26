import { EpubHomeWorkbench } from '@/components/epub/epub-home-workbench';
import { LocaleLink } from '@/i18n/navigation';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import {
  ArrowUpRight,
  Check,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Flame,
  Lock,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '',
  });
}

const trustChips = [
  { icon: Lock, label: 'Private by default' },
  { icon: FileText, label: 'Auto-delete in 1 hour' },
  { icon: Check, label: 'No AI training' },
  { icon: Smartphone, label: 'DRM not supported' },
];

const quickFormatEntries = [
  {
    title: 'PDF',
    description: 'Print-ready layout',
    href: '/epub-to-pdf',
  },
  {
    title: 'Kindle',
    description: 'AZW3 recommended',
    href: '/epub-to-kindle',
  },
  {
    title: 'Markdown',
    description: 'Knowledge workflow',
    href: '/epub-to-markdown',
  },
  {
    title: 'TXT',
    description: 'Clean text extraction',
    href: '/epub-to-txt',
  },
  {
    title: 'Word',
    description: 'Editable DOCX',
    href: '/epub-to-docx',
  },
];

const scenarioCards = [
  {
    icon: Smartphone,
    title: 'Read on Kindle',
    description: 'Recommended: AZW3 for modern devices',
    href: '/epub-to-kindle',
  },
  {
    icon: FileText,
    title: 'Print or share',
    description: 'Clean PDF with proper headings and layout',
    href: '/epub-to-pdf',
  },
  {
    icon: FileCode2,
    title: 'Use with AI notes',
    description: 'Markdown for Obsidian, Notion, ChatGPT, Claude',
    href: '/epub-to-markdown',
    badge: 'Soon',
  },
  {
    icon: FileSpreadsheet,
    title: 'Edit in Word',
    description: 'DOCX for editing, annotation, collaboration',
    href: '/epub-to-docx',
  },
];

const recommendationRows = [
  {
    label: 'Kindle reading',
    value: 'AZW3',
    detail: 'Best default for modern Kindle devices',
  },
  {
    label: 'Print / share',
    value: 'PDF',
    detail: 'Great for layout-preserved reading and exporting',
  },
  {
    label: 'AI notes',
    value: 'Markdown / TXT',
    detail: 'Markdown soon, TXT available today',
  },
  {
    label: 'Edit document',
    value: 'DOCX',
    detail: 'Best for review, comments, and collaboration',
  },
];

const compareRows = [
  {
    label: 'Reading-optimized presets',
    ours: true,
    generic: 'Often missing',
  },
  {
    label: 'Preserve headings, TOC & metadata',
    ours: true,
    generic: 'Sometimes lost',
  },
  {
    label: 'Images & typography preserved',
    ours: true,
    generic: 'Often broken',
  },
  {
    label: 'Privacy & auto-delete',
    ours: true,
    generic: 'Rarely guaranteed',
  },
];

const faqItems = [
  {
    question: 'How long are files stored?',
    answer:
      'Uploaded and converted files are automatically deleted after 1 hour.',
  },
  {
    question: 'Do you use my ebooks for AI training?',
    answer:
      'No. EPUBFlow does not use uploaded ebook content for AI training.',
  },
  {
    question: 'Which Kindle format should I choose?',
    answer:
      'Use AZW3 for most modern Kindle devices. Use MOBI only for older compatibility needs.',
  },
  {
    question: 'Can I convert DRM-protected ebooks?',
    answer: 'No. DRM-protected ebooks are not supported.',
  },
  {
    question: 'Which formats work today?',
    answer:
      'PDF, Kindle (AZW3/MOBI), TXT, and DOCX are available now. Markdown is the next rollout.',
  },
];

export default async function HomePage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,#fff8f2_0%,#faf8f6_48%,#f6f5f4_100%)] text-[#111827]">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 w-fit rounded-full border border-[#f1d7ca] bg-white/90 px-4 py-2 text-sm shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
          <span className="font-semibold text-[#ef3f0a]">Now live</span>{' '}
          <span className="text-[#4b5563]">
            EPUB to PDF, Kindle, TXT, and DOCX conversions
          </span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ece5df] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
              <Flame className="h-3.5 w-3.5 text-[#ef3f0a]" />
              Reader-first EPUB conversion
            </div>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.03] tracking-[-0.05em] text-[#111827] sm:text-6xl">
              Convert <span className="text-[#ef3f0a]">EPUB</span> for Kindle,
              PDF & Markdown
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6b7280] sm:text-lg">
              Choose your reading goal and get the best format automatically.
              Start from the converter on the right, then jump into the exact
              format page if you need a deeper workflow.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {trustChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#ece5df] bg-white px-3.5 py-2 text-xs font-medium text-[#4b5563] shadow-[0_8px_24px_rgba(17,24,39,0.04)]"
                >
                  <chip.icon className="h-3.5 w-3.5" />
                  {chip.label}
                </span>
              ))}
            </div>

            <div className="mt-5 text-sm text-[#6b7280]">
              Learn more:{' '}
              <LocaleLink href="/privacy" className="text-[#ef3f0a] hover:underline">
                Privacy Policy
              </LocaleLink>{' '}
              /{' '}
              <LocaleLink
                href="/data-retention"
                className="text-[#ef3f0a] hover:underline"
              >
                Data Retention
              </LocaleLink>
            </div>
          </div>

          <div id="converter">
            <EpubHomeWorkbench />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickFormatEntries.map((entry) => (
            <LocaleLink
              key={entry.href}
              href={entry.href}
              className="rounded-2xl border border-[#ece5df] bg-white p-4 shadow-[0_10px_26px_rgba(17,24,39,0.04)] transition hover:-translate-y-0.5 hover:border-[#ef3f0a]/40"
            >
              <p className="text-base font-semibold text-[#111827]">{entry.title}</p>
              <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                {entry.description}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#ef3f0a]">
                Open format page
                <ArrowUpRight className="h-3.5 w-3.5" />
              </p>
            </LocaleLink>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ef3f0a]">
            Reading goal presets
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Pick the outcome you actually want
          </h2>
          <p className="mt-3 text-base leading-7 text-[#6b7280]">
            EPUBFlow is easiest to use when you think in outcomes, not file
            formats. Start from your reading goal and we will guide the output.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {scenarioCards.map((card) => (
            <LocaleLink
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-[#ece5df] bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition hover:-translate-y-1 hover:border-[#ef3f0a]/35"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex rounded-2xl bg-[#fff2eb] p-3 text-[#ef3f0a]">
                  <card.icon className="h-5 w-5" />
                </div>
                {card.badge ? (
                  <span className="rounded-full bg-[#fff3ec] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#ef3f0a]">
                    {card.badge}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#111827]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                {card.description}
              </p>
              <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#111827] transition group-hover:text-[#ef3f0a]">
                Explore this workflow
                <ArrowUpRight className="h-4 w-4" />
              </p>
            </LocaleLink>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#ece5df] bg-white p-6 shadow-[0_16px_50px_rgba(17,24,39,0.05)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ef3f0a]">
                Format guide
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Not sure which format to choose?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#6b7280]">
                Start from your reading goal. EPUBFlow is designed to make the
                format decision obvious instead of forcing users to guess.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#ede7e2]">
              {recommendationRows.map((row, index) => (
                <div
                  key={row.label}
                  className={[
                    'grid gap-3 px-4 py-4 sm:grid-cols-[1.05fr_0.65fr_1.3fr] sm:items-center',
                    index !== 0 ? 'border-t border-[#ede7e2]' : '',
                  ].join(' ')}
                >
                  <span className="text-sm font-medium text-[#111827]">
                    {row.label}
                  </span>
                  <span className="inline-flex w-fit rounded-full bg-[#fff2eb] px-3 py-1.5 text-sm font-semibold text-[#ef3f0a]">
                    {row.value}
                  </span>
                  <span className="text-sm text-[#6b7280]">{row.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="docs" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#ece5df] bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.06)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ef3f0a]">
                Why EPUBFlow
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Better for reading,
                <br />
                not just conversion
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#6b7280]">
                We optimize for readable output, cleaner structure, and stronger
                privacy defaults instead of raw file generation.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#eceff3]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-[#fcfcfd] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                <span>Feature</span>
                <span className="text-[#ef3f0a]">EPUBFlow</span>
                <span>Generic converters</span>
              </div>
              {compareRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-t border-[#eceff3] px-4 py-3"
                >
                  <span className="text-sm text-[#111827]">{row.label}</span>
                  <span className="inline-flex items-center text-green-600">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-[#6b7280]">{row.generic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faqs" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ef3f0a]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            Common questions before you convert
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {faqItems.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-[#ece5df] bg-white p-5 shadow-[0_10px_28px_rgba(17,24,39,0.04)]"
            >
              <h3 className="text-base font-semibold text-[#111827]">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6b7280]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#ffd9cb] bg-[linear-gradient(135deg,#fff8f3_0%,#fff4ef_45%,#fffaf7_100%)] p-6 shadow-[0_16px_50px_rgba(239,63,10,0.08)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex rounded-2xl bg-white p-2.5 text-[#ef3f0a] shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
                Convert your EPUB in seconds
              </h2>
              <p className="mt-3 text-base leading-7 text-[#6b7280]">
                Start from the upload area at the top and choose the output that
                matches your reading goal.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#converter"
                className="inline-flex h-12 items-center rounded-xl bg-[#ef3f0a] px-6 text-sm font-semibold text-white transition hover:bg-[#dc3506]"
              >
                Choose EPUB File
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
