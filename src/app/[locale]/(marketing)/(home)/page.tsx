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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  const trustChips = [
    { icon: Lock, label: t('trust.private') },
    { icon: FileText, label: t('trust.autoDelete') },
    { icon: Check, label: t('trust.noAiTraining') },
  ];

  const quickFormatEntries = [
    {
      title: t('quickFormats.pdf.title'),
      description: t('quickFormats.pdf.description'),
      href: '/epub-to-pdf',
    },
    {
      title: t('quickFormats.kindle.title'),
      description: t('quickFormats.kindle.description'),
      href: '/epub-to-kindle',
    },
    {
      title: t('quickFormats.markdown.title'),
      description: t('quickFormats.markdown.description'),
      href: '/epub-to-markdown',
    },
    {
      title: t('quickFormats.txt.title'),
      description: t('quickFormats.txt.description'),
      href: '/epub-to-txt',
    },
    {
      title: t('quickFormats.word.title'),
      description: t('quickFormats.word.description'),
      href: '/epub-to-docx',
    },
  ];

  const scenarioCards = [
    {
      icon: Smartphone,
      title: t('readingGoals.cards.kindle.title'),
      description: t('readingGoals.cards.kindle.description'),
      href: '/epub-to-kindle',
    },
    {
      icon: FileText,
      title: t('readingGoals.cards.pdf.title'),
      description: t('readingGoals.cards.pdf.description'),
      href: '/epub-to-pdf',
    },
    {
      icon: FileCode2,
      title: t('readingGoals.cards.markdown.title'),
      description: t('readingGoals.cards.markdown.description'),
      href: '/epub-to-markdown',
      badge: t('readingGoals.cards.markdown.badge'),
    },
    {
      icon: FileSpreadsheet,
      title: t('readingGoals.cards.docx.title'),
      description: t('readingGoals.cards.docx.description'),
      href: '/epub-to-docx',
    },
  ];

  const recommendationRows = [
    {
      label: t('formatGuide.rows.kindle.label'),
      value: t('formatGuide.rows.kindle.value'),
      detail: t('formatGuide.rows.kindle.detail'),
    },
    {
      label: t('formatGuide.rows.pdf.label'),
      value: t('formatGuide.rows.pdf.value'),
      detail: t('formatGuide.rows.pdf.detail'),
    },
    {
      label: t('formatGuide.rows.notes.label'),
      value: t('formatGuide.rows.notes.value'),
      detail: t('formatGuide.rows.notes.detail'),
    },
    {
      label: t('formatGuide.rows.docx.label'),
      value: t('formatGuide.rows.docx.value'),
      detail: t('formatGuide.rows.docx.detail'),
    },
  ];

  const compareRows = [
    {
      label: t('comparison.rows.presets.label'),
      generic: t('comparison.rows.presets.generic'),
    },
    {
      label: t('comparison.rows.structure.label'),
      generic: t('comparison.rows.structure.generic'),
    },
    {
      label: t('comparison.rows.images.label'),
      generic: t('comparison.rows.images.generic'),
    },
    {
      label: t('comparison.rows.privacy.label'),
      generic: t('comparison.rows.privacy.generic'),
    },
  ];

  const faqItems = [
    {
      question: t('faq.items.storage.question'),
      answer: t('faq.items.storage.answer'),
    },
    {
      question: t('faq.items.training.question'),
      answer: t('faq.items.training.answer'),
    },
    {
      question: t('faq.items.kindle.question'),
      answer: t('faq.items.kindle.answer'),
    },
    {
      question: t('faq.items.drm.question'),
      answer: t('faq.items.drm.answer'),
    },
    {
      question: t('faq.items.formats.question'),
      answer: t('faq.items.formats.answer'),
    },
  ];

  return (
    <div className="bg-[radial-gradient(circle_at_top,#fff8f2_0%,#faf8f6_48%,#f6f5f4_100%)] text-[#111827]">
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 w-fit rounded-full border border-[#f1d7ca] bg-white/90 px-4 py-1.5 text-xs shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:text-sm">
          <span className="font-semibold text-[#ef3f0a]">{t('liveBadgePrefix')}</span>{' '}
          <span className="text-[#4b5563]">{t('liveBadgeText')}</span>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6">
          <div className="max-w-[30rem] pt-0 lg:pt-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ece5df] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
              <Flame className="h-3.5 w-3.5 text-[#ef3f0a]" />
              {t('eyebrow')}
            </div>
            <h1 className="mt-3 max-w-[10ch] text-balance text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[2.8rem] lg:text-[3.55rem]">
              {t('titlePrefix')} <span className="text-[#ef3f0a]">{t('titleAccent')}</span>{' '}
              {t('titleSuffix')}
            </h1>
            <p className="mt-3 max-w-[24rem] text-sm leading-6 text-[#6b7280]">
              {t('description')}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
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

          </div>

          <div id="converter" className="lg:pt-0.5">
            <EpubHomeWorkbench />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                {t('quickFormats.cta')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </p>
            </LocaleLink>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ef3f0a]">
            {t('readingGoals.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('readingGoals.title')}
          </h2>
          <p className="mt-3 text-base leading-7 text-[#6b7280]">
            {t('readingGoals.description')}
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
                {t('readingGoals.cta')}
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
                {t('formatGuide.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                {t('formatGuide.title')}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#6b7280]">
                {t('formatGuide.description')}
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
                {t('comparison.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                {t('comparison.titleLine1')}
                <br />
                {t('comparison.titleLine2')}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#6b7280]">
                {t('comparison.description')}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#eceff3]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-[#fcfcfd] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                <span>{t('comparison.headerFeature')}</span>
                <span className="text-[#ef3f0a]">{t('comparison.headerOurs')}</span>
                <span>{t('comparison.headerGeneric')}</span>
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
            {t('faq.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            {t('faq.title')}
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
                {t('bottomCta.title')}
              </h2>
              <p className="mt-3 text-base leading-7 text-[#6b7280]">
                {t('bottomCta.description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#converter"
                className="inline-flex h-12 items-center rounded-xl bg-[#ef3f0a] px-6 text-sm font-semibold text-white transition hover:bg-[#dc3506]"
              >
                {t('bottomCta.button')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
