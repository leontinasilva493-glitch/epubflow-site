import { EpubPdfWorkbench } from '@/components/epub/epub-pdf-workbench';
import { constructMetadata } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import {
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  FileCode2,
  FileText,
  Layers3,
  Lock,
  Moon,
  Rocket,
  ShieldCheck,
  Smartphone,
  Upload,
  User,
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

const heroChips = [
  { icon: Smartphone, label: 'Kindle-ready' },
  { icon: FileText, label: 'PDF export' },
  { icon: FileCode2, label: 'Markdown notes' },
  { icon: Lock, label: 'Private & secure' },
  { icon: User, label: 'No signup' },
];

const featureCards = [
  {
    icon: BookOpen,
    title: 'Reader-first presets',
    description:
      'Optimized outputs for Kindle, PDF, Markdown, and Word with smart defaults for the best reading experience.',
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
  },
  {
    icon: FileCode2,
    title: 'EPUB to Markdown',
    description:
      'Clean, structured Markdown for Obsidian, Notion, AI notes, and your research workflow.',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description:
      'Your files are encrypted, converted in private, and auto-deleted after 24 hours. We never store your content.',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    icon: FileText,
    title: 'Clean PDF layout',
    description:
      'Generate print-ready PDFs with proper headings, typography, images, and page breaks preserved.',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
  },
  {
    icon: Layers3,
    title: 'Batch convert',
    description:
      'Convert up to 50 EPUBs at once. Save time with queue, background processing, and notifications.',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
  },
  {
    icon: Eye,
    title: 'Quality preview',
    description:
      'Preview chapters, check structure and metadata before converting. Better results, every time.',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
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

export default async function HomePage() {
  return (
    <div className="bg-gradient-to-b from-[#f9f8f7] via-[#fafafa] to-[#f7f7f7] text-[#111827]">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 w-fit rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
          <span className="font-medium text-blue-600">New:</span>{' '}
          <span className="text-[#374151]">
            Batch convert up to 50 EPUBs at once
          </span>{' '}
          <ChevronRight className="mb-0.5 inline h-4 w-4 text-[#6b7280]" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-[#111827] sm:text-6xl">
            Convert <span className="text-[#ef3f0a]">EPUB</span> for Kindle,
            <br />
            PDF & Markdown
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#6b7280] sm:text-lg">
            Choose your reading goal and get the best format automatically.
            Beautiful output. Preserves formatting. 100% private.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ef3f0a] px-6 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(239,63,10,0.25)] transition hover:-translate-y-0.5 hover:bg-[#dc3506]"
            >
              <Upload className="h-4 w-4" />
              Convert EPUB Now
            </button>
            <button
              type="button"
              className="inline-flex h-12 items-center rounded-xl border border-[#e5e7eb] bg-white px-6 text-sm font-semibold text-[#111827] transition hover:-translate-y-0.5 hover:bg-[#f8fafc]"
            >
              See Demo
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {heroChips.map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-2 text-xs font-medium text-[#4b5563] shadow-[0_6px_20px_rgba(15,23,42,0.04)]"
              >
                <chip.icon className="h-3.5 w-3.5" />
                {chip.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
          <EpubPdfWorkbench />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need for the perfect conversion
        </h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
            >
              <div
                className={cn(
                  'mb-4 inline-flex rounded-xl p-2.5',
                  feature.iconBg,
                  feature.iconColor
                )}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Better for reading,
                <br />
                not just file conversion
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#6b7280]">
                We preserve what matters: structure, styling, images, and
                semantics, so your content looks great and reads naturally
                everywhere.
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

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#ffd9cb] bg-gradient-to-r from-[#fff7f3] to-[#fffaf7] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex rounded-xl bg-white p-2 text-[#ef3f0a] shadow-sm">
                <Rocket className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
                Start converting in seconds
              </h2>
              <p className="mt-3 text-base leading-7 text-[#6b7280]">
                No signup. No credit card. Just upload your EPUB and get the
                perfect format for your reading goal.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex h-12 items-center rounded-xl bg-[#ef3f0a] px-6 text-sm font-semibold text-white transition hover:bg-[#dc3506]"
              >
                Convert EPUB Now
              </button>
              <button
                type="button"
                className="inline-flex h-12 items-center rounded-xl border border-[#e5e7eb] bg-white px-6 text-sm font-semibold text-[#111827]"
              >
                See Demo
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {[
              'Works on any device',
              'Free daily conversions',
              'Secure & private',
              'Cancel anytime',
            ].map((chip) => (
              <span
                key={chip}
                className="inline-flex rounded-full border border-[#ffd9cb] bg-white px-3 py-1.5 text-xs font-medium text-[#6b7280]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-4 right-4 hidden rounded-full border border-[#e5e7eb] bg-white p-2 shadow-sm lg:inline-flex">
        <Moon className="h-4 w-4 text-[#6b7280]" />
      </div>
    </div>
  );
}
