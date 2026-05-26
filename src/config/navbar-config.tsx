'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';

/**
 * Keep navbar minimal for the static v1 landing.
 */
export function useNavbarLinks(): NestedMenuItem[] {
  return [
    {
      title: 'Convert',
      items: [
        { title: 'EPUB to PDF', href: Routes.EpubToPdf, external: false },
        { title: 'EPUB to Kindle', href: Routes.EpubToKindle, external: false },
        {
          title: 'EPUB to Markdown',
          href: Routes.EpubToMarkdown,
          external: false,
        },
        { title: 'EPUB to TXT', href: Routes.EpubToTxt, external: false },
        { title: 'EPUB to Word', href: Routes.EpubToDocx, external: false },
      ],
    },
    {
      title: 'Pricing',
      href: Routes.Pricing,
      external: false,
    },
    {
      title: 'FAQ',
      href: Routes.FAQ,
      external: false,
    },
  ];
}
