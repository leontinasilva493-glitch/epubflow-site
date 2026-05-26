'use client';

import { EpubHeroLiteWorkbench } from '@/components/epub/epub-hero-lite-workbench';
import { LocaleLink } from '@/i18n/navigation';
import type { ConversionFormat } from '@/lib/epub-converter/format-config';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type HomeFormatOption = {
  key: 'pdf' | 'kindle' | 'markdown' | 'txt' | 'docx';
  label: string;
  description: string;
  format?: ConversionFormat;
  apiEndpoint?: string;
  formatLabel?: string;
  comingSoon?: boolean;
  href?: string;
};

export function EpubHomeWorkbench() {
  const t = useTranslations('HomeWorkbench');
  const [selectedKey, setSelectedKey] =
    useState<HomeFormatOption['key']>('pdf');

  const homeFormatOptions = useMemo<HomeFormatOption[]>(
    () => [
      {
        key: 'pdf',
        label: t('formats.pdf.label'),
        description: t('formats.pdf.description'),
        format: 'pdf',
        apiEndpoint: '/api/conversions/epub-to-pdf',
        formatLabel: t('formats.pdf.outputLabel'),
      },
      {
        key: 'kindle',
        label: t('formats.kindle.label'),
        description: t('formats.kindle.description'),
        format: 'azw3',
        apiEndpoint: '/api/conversions/epub-to-azw3',
        formatLabel: t('formats.kindle.outputLabel'),
      },
      {
        key: 'markdown',
        label: t('formats.markdown.label'),
        description: t('formats.markdown.description'),
        comingSoon: true,
        href: '/epub-to-markdown',
      },
      {
        key: 'txt',
        label: t('formats.txt.label'),
        description: t('formats.txt.description'),
        format: 'txt',
        apiEndpoint: '/api/conversions/epub-to-txt',
        formatLabel: t('formats.txt.outputLabel'),
      },
      {
        key: 'docx',
        label: t('formats.docx.label'),
        description: t('formats.docx.description'),
        format: 'docx',
        apiEndpoint: '/api/conversions/epub-to-docx',
        formatLabel: t('formats.docx.outputLabel'),
      },
    ],
    [t]
  );

  const selected =
    homeFormatOptions.find((option) => option.key === selectedKey)!;

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e7ddd7] bg-white shadow-[0_28px_90px_rgba(17,24,39,0.12)]">
      <div className="border-b border-[#f1e8e3] bg-[linear-gradient(180deg,#fffaf7_0%,#ffffff_100%)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {homeFormatOptions.map((option) => {
            const isActive = option.key === selectedKey;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedKey(option.key)}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'border-[#ef3f0a] bg-[#ef3f0a] text-white shadow-[0_10px_24px_rgba(239,63,10,0.24)]'
                    : 'border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#ef3f0a]/30 hover:text-[#111827]',
                ].join(' ')}
              >
                <span>{option.label}</span>
                {option.comingSoon ? (
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#fff1eb] text-[#ef3f0a]',
                    ].join(' ')}
                  >
                    {t('formats.markdown.badge')}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#6b7280]">
          {selected.description}
        </p>
      </div>

      {selected.comingSoon ? (
        <div className="grid gap-5 p-6 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-dashed border-[#f3cbbd] bg-[#fff8f4] p-6">
            <div className="inline-flex rounded-full bg-white p-2 text-[#ef3f0a] shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#111827]">
              {t('comingSoon.title')}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">
              {t('comingSoon.description')}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <LocaleLink
                href={selected.href || '/epub-to-markdown'}
                className="inline-flex h-11 items-center rounded-xl bg-[#ef3f0a] px-5 text-sm font-semibold text-white transition hover:bg-[#dc3506]"
              >
                {t('comingSoon.viewPage')}
              </LocaleLink>
              <button
                type="button"
                onClick={() => setSelectedKey('txt')}
                className="inline-flex h-11 items-center rounded-xl border border-[#e5e7eb] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#f8fafc]"
              >
                {t('comingSoon.useTxt')}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <h4 className="text-sm font-semibold text-[#111827]">
              {t('comingSoon.whyTitle')}
            </h4>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#6b7280]">
              <li>{t('comingSoon.reasons.r1')}</li>
              <li>{t('comingSoon.reasons.r2')}</li>
              <li>{t('comingSoon.reasons.r3')}</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-[#f1e8e3] bg-[#fcfcfd] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                {t('comingSoon.alternativeEyebrow')}
              </p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">
                {t('comingSoon.alternativeTitle')}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#6b7280]">
                {t('comingSoon.alternativeDescription')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EpubHeroLiteWorkbench
          key={selected.key}
          format={selected.format!}
          apiEndpoint={selected.apiEndpoint!}
          formatLabel={selected.formatLabel!}
        />
      )}

    </div>
  );
}
