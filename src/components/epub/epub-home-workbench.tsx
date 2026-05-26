'use client';

import { EpubConvertWorkbench } from '@/components/epub/epub-convert-workbench';
import { LocaleLink } from '@/i18n/navigation';
import type { ConversionFormat } from '@/lib/epub-converter/format-config';
import { Lock, Sparkles } from 'lucide-react';
import { useState } from 'react';

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

const HOME_FORMAT_OPTIONS: HomeFormatOption[] = [
  {
    key: 'pdf',
    label: 'PDF',
    description: 'Best for print, sharing, and clean reading layouts.',
    format: 'pdf',
    apiEndpoint: '/api/conversions/epub-to-pdf',
    formatLabel: 'PDF',
  },
  {
    key: 'kindle',
    label: 'Kindle',
    description: 'Recommended output for modern Kindle devices.',
    format: 'azw3',
    apiEndpoint: '/api/conversions/epub-to-azw3',
    formatLabel: 'Kindle (AZW3)',
  },
  {
    key: 'markdown',
    label: 'Markdown',
    description: 'Structured notes for Obsidian, Notion, and AI workflows.',
    comingSoon: true,
    href: '/epub-to-markdown',
  },
  {
    key: 'txt',
    label: 'TXT',
    description: 'Fast plain-text extraction for lightweight use cases.',
    format: 'txt',
    apiEndpoint: '/api/conversions/epub-to-txt',
    formatLabel: 'TXT',
  },
  {
    key: 'docx',
    label: 'Word',
    description: 'Editable DOCX for reviews, comments, and collaboration.',
    format: 'docx',
    apiEndpoint: '/api/conversions/epub-to-docx',
    formatLabel: 'Word (DOCX)',
  },
];

export function EpubHomeWorkbench() {
  const [selectedKey, setSelectedKey] = useState<HomeFormatOption['key']>('pdf');
  const selected = HOME_FORMAT_OPTIONS.find((option) => option.key === selectedKey)!;

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e7ddd7] bg-white shadow-[0_28px_90px_rgba(17,24,39,0.12)]">
      <div className="border-b border-[#f1e8e3] bg-[linear-gradient(180deg,#fffaf7_0%,#ffffff_100%)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {HOME_FORMAT_OPTIONS.map((option) => {
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
                        ? 'bg-white/18 text-white'
                        : 'bg-[#fff1eb] text-[#ef3f0a]',
                    ].join(' ')}
                  >
                    Soon
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
              EPUB to Markdown is launching next
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">
              We are polishing heading structure, cleanup quality, and note-ready
              output so Markdown feels genuinely useful for Obsidian, Notion, and
              AI workflows.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <LocaleLink
                href={selected.href || '/epub-to-markdown'}
                className="inline-flex h-11 items-center rounded-xl bg-[#ef3f0a] px-5 text-sm font-semibold text-white transition hover:bg-[#dc3506]"
              >
                View Markdown page
              </LocaleLink>
              <button
                type="button"
                onClick={() => setSelectedKey('txt')}
                className="inline-flex h-11 items-center rounded-xl border border-[#e5e7eb] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#f8fafc]"
              >
                Use TXT today
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <h4 className="text-sm font-semibold text-[#111827]">Why we are waiting</h4>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#6b7280]">
              <li>Preserve heading hierarchy for long ebooks.</li>
              <li>Keep output usable for notes, research, and AI prompts.</li>
              <li>Avoid shipping low-quality Markdown just for checkbox coverage.</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-[#f1e8e3] bg-[#fcfcfd] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                Best current alternative
              </p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">EPUB to TXT</p>
              <p className="mt-1 text-sm leading-6 text-[#6b7280]">
                Clean text extraction is already live and works well for quick AI
                note preparation.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EpubConvertWorkbench
          key={selected.key}
          format={selected.format!}
          apiEndpoint={selected.apiEndpoint!}
          formatLabel={selected.formatLabel!}
          formatDescription={selected.description}
        />
      )}

      <div className="border-t border-[#f1e8e3] bg-[#fffaf7] px-5 py-3 text-xs text-[#6b7280] sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Private by default
          </span>
          <span>Auto-delete in 1 hour</span>
          <span>No AI training</span>
          <span>DRM not supported</span>
        </div>
      </div>
    </div>
  );
}
