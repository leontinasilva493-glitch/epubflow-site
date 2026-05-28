'use client';

import { EpubHeroLiteWorkbench } from '@/components/epub/epub-hero-lite-workbench';
import type { ConversionFormat } from '@/lib/epub-converter/format-config';
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

  const selected = homeFormatOptions.find(
    (option) => option.key === selectedKey
  )!;

  return (
    <div className="overflow-hidden rounded-[30px] border border-[#ded7cf] bg-white shadow-[0_30px_95px_rgba(17,24,39,0.13)]">
      <EpubHeroLiteWorkbench
        format={selected.format!}
        apiEndpoint={selected.apiEndpoint!}
        formatLabel={selected.formatLabel!}
        formatOptions={homeFormatOptions}
        selectedFormatKey={selectedKey}
        onFormatChange={(key) =>
          setSelectedKey(key as HomeFormatOption['key'])
        }
        soonLabel={t('formats.markdown.badge')}
        selectorTitle={t('selector.title')}
        selectorDescription={t('selector.description')}
      />
    </div>
  );
}
