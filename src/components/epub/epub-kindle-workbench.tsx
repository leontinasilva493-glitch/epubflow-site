'use client';

import { EpubConvertWorkbench } from '@/components/epub/epub-convert-workbench';
import { useState } from 'react';

type KindleFormat = 'azw3' | 'mobi';

const kindleFormatConfig: Record<
  KindleFormat,
  { label: string; description: string; apiEndpoint: string }
> = {
  azw3: {
    label: 'Kindle (AZW3)',
    description: 'Recommended for modern Kindle devices',
    apiEndpoint: '/api/conversions/epub-to-azw3',
  },
  mobi: {
    label: 'Kindle (MOBI)',
    description: 'Compatible with older Kindle devices and apps',
    apiEndpoint: '/api/conversions/epub-to-mobi',
  },
};

export function EpubKindleWorkbench() {
  const [kindleFormat, setKindleFormat] = useState<KindleFormat>('azw3');
  const selected = kindleFormatConfig[kindleFormat];

  return (
    <div>
      <div className="border-b border-[#eef0f3] bg-[#fcfcfd] px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
          Kindle output
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setKindleFormat('azw3')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              kindleFormat === 'azw3'
                ? 'bg-[#ef3f0a] text-white'
                : 'border border-[#e5e7eb] bg-white text-[#374151]'
            }`}
          >
            AZW3 (Recommended)
          </button>
          <button
            type="button"
            onClick={() => setKindleFormat('mobi')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              kindleFormat === 'mobi'
                ? 'bg-[#ef3f0a] text-white'
                : 'border border-[#e5e7eb] bg-white text-[#374151]'
            }`}
          >
            MOBI
          </button>
        </div>
      </div>

      <EpubConvertWorkbench
        key={kindleFormat}
        format={kindleFormat}
        apiEndpoint={selected.apiEndpoint}
        formatLabel={selected.label}
        formatDescription={selected.description}
      />
    </div>
  );
}
