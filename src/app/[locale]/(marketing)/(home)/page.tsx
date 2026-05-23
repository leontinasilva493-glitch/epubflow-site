import { constructMetadata } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import {
  BookOpen,
  Check,
  CircleHelp,
  ChevronRight,
  ChevronsUpDown,
  Crown,
  Eye,
  FileCode2,
  FileText,
  Folder,
  History,
  Layers3,
  Lock,
  Moon,
  NotebookTabs,
  Rocket,
  Settings,
  ShieldCheck,
  Smartphone,
  Upload,
  User,
  WandSparkles,
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
          <div className="grid xl:grid-cols-[180px_1fr_320px]">
            <aside className="border-b border-r border-[#eef0f3] bg-[#fcfcfd] px-4 py-5 xl:border-b-0">
              <div className="mb-5 flex items-center gap-2 font-semibold text-[#111827]">
                <div className="rounded-md bg-[#ef3f0a] p-1.5 text-white">
                  <BookOpen className="h-4 w-4" />
                </div>
                EPUBFlow
              </div>
              <nav className="space-y-1.5 text-sm">
                {[
                  { label: 'Convert', icon: WandSparkles },
                  { label: 'Library', icon: Folder },
                  { label: 'History', icon: History },
                  { label: 'Presets', icon: NotebookTabs },
                  { label: 'Settings', icon: Settings },
                ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-[#4b5563]',
                        item.label === 'Convert' &&
                          'bg-[#fff1eb] font-medium text-[#ef3f0a]'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  ))}
              </nav>

              <div className="mt-8 rounded-xl border border-[#eceff3] bg-white p-3.5">
                <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                  <Crown className="h-4 w-4 text-[#ef3f0a]" />
                  Pro Plan
                </div>
                <p className="text-xs leading-5 text-[#6b7280]">
                  Unlimited conversions
                  <br />
                  Batch & advanced options
                </p>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-[#ffd8ca] bg-[#fff6f2] px-3 py-2 text-xs font-semibold text-[#ef3f0a] hover:bg-[#ffefe8]"
                >
                  Upgrade Plan
                </button>
              </div>
            </aside>

            <div className="border-b border-r border-[#eef0f3] p-6 xl:border-b-0">
              <h3 className="text-sm font-semibold text-[#111827]">
                1. Upload your EPUB
              </h3>
              <div className="mt-3 flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d1d5db] bg-white text-center">
                <Upload className="mb-2 h-5 w-5 text-[#4b5563]" />
                <p className="text-sm text-[#4b5563]">Drag & drop your EPUB file here</p>
                <p className="text-sm text-blue-600">or click to browse</p>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#fbfcfe] px-3 py-2.5">
                <div className="text-sm font-medium text-[#374151]">
                  The Time Machine.epub
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                  1.2 MB
                  <span className="inline-flex rounded-full bg-green-100 p-1 text-green-600">
                    <Check className="h-3 w-3" />
                  </span>
                </div>
              </div>

              <h3 className="mt-6 text-sm font-semibold text-[#111827]">
                2. Choose your reading goal
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: 'Kindle',
                    subtitle: '(best .mobi)',
                    icon: Smartphone,
                    active: true,
                    iconClass: 'text-[#374151]',
                  },
                  {
                    title: 'Print PDF',
                    subtitle: '(clean layout)',
                    icon: FileText,
                    active: false,
                    iconClass: 'text-[#374151]',
                  },
                  {
                    title: 'Obsidian / Markdown',
                    subtitle: '(notes & research)',
                    icon: FileCode2,
                    active: false,
                    iconClass: 'text-violet-600',
                  },
                  {
                    title: 'Edit in Word',
                    subtitle: '(.docx)',
                    icon: Settings,
                    active: false,
                    iconClass: 'text-blue-600',
                  },
                ].map((goal) => (
                  <button
                    key={goal.title}
                    type="button"
                    className={cn(
                      'rounded-2xl border px-4 py-4 text-left transition',
                      goal.active
                        ? 'border-[#ef3f0a] bg-[#fff7f3] shadow-[0_10px_25px_rgba(239,63,10,0.09)]'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#fcfcfd]'
                    )}
                  >
                    <goal.icon className={cn('mb-3 h-5 w-5', goal.iconClass)} />
                    <p className="text-sm font-semibold text-[#111827]">{goal.title}</p>
                    <p className="text-xs text-[#6b7280]">{goal.subtitle}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Recommended output
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">Kindle (MOBI)</p>
                    <p className="text-sm text-[#6b7280]">
                      Optimized for Kindle devices and apps
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Best for reading
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center rounded-lg bg-[#ef3f0a] px-4 text-xs font-semibold text-white hover:bg-[#dc3506]"
                  >
                    Convert EPUB
                  </button>
                </div>
              </div>
            </div>

            <aside className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#111827]">Preview</h3>
                <div className="flex items-center gap-2 text-[#6b7280]">
                  <CircleHelp className="h-4 w-4" />
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-2 py-1 text-xs font-semibold text-[#4b5563]">
                    MA
                  </span>
                  <ChevronsUpDown className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <div className="h-28 w-20 rounded-lg bg-gradient-to-b from-slate-700 to-slate-950 p-2 text-[8px] text-slate-100">
                  H. G. Wells
                  <div className="mt-5 text-[10px] font-semibold">The Time Machine</div>
                </div>
                <div>
                  <p className="font-semibold text-[#111827]">The Time Machine</p>
                  <p className="text-sm text-[#6b7280]">H. G. Wells</p>
                  <p className="mt-2 text-xs text-[#6b7280]">24 chapters</p>
                  <p className="text-xs text-[#6b7280]">79,221 words</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  About this book
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  A scientist builds a machine to travel through time and
                  ventures far into the future, where he discovers the fate of
                  humanity.
                </p>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Progress
                </p>
                <p className="mt-2 text-sm font-medium text-[#111827]">Ready to convert</p>
                <p className="text-sm text-[#6b7280]">
                  Your file is ready. Click convert to start.
                </p>
                <div className="mt-3 h-2 rounded-full bg-[#edf1f4]">
                  <div className="h-2 w-0 rounded-full bg-[#ef3f0a]" />
                </div>
                <p className="mt-2 text-right text-xs text-[#6b7280]">0%</p>
              </div>

              <div className="mt-5 space-y-2">
                {[
                  { title: 'Secure upload', subtitle: 'Encrypted & private' },
                  { title: 'Auto-delete', subtitle: 'Files deleted after 24h' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{item.title}</p>
                      <p className="text-xs text-[#6b7280]">{item.subtitle}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-green-100 p-1 text-green-600">
                      <Check className="h-3 w-3" />
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
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
