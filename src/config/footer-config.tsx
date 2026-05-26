'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';

/**
 * Footer links for static v1 launch.
 */
export function useFooterLinks(): NestedMenuItem[] {
  return [
    {
      title: 'Product',
      items: [
        { title: 'Features', href: Routes.Features, external: false },
        { title: 'Pricing', href: Routes.Pricing, external: false },
        { title: 'FAQ', href: Routes.FAQ, external: false },
      ],
    },
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
        { title: 'EPUB to DOCX', href: Routes.EpubToDocx, external: false },
      ],
    },
    {
      title: 'Resources',
      items: [
        {
          title: 'MOBI vs AZW3 vs EPUB',
          href: Routes.GuideMobiVsAzw3VsEpub,
          external: false,
        },
        {
          title: 'Best eBook Format for Kindle',
          href: Routes.GuideBestEbookFormatForKindle,
          external: false,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        { title: 'Data Retention', href: Routes.DataRetention, external: false },
        { title: 'Refund Policy', href: Routes.RefundPolicy, external: false },
        { title: 'Cookie Policy', href: Routes.CookiePolicy, external: false },
        { title: 'Privacy Policy', href: Routes.PrivacyPolicy, external: false },
        { title: 'Terms of Service', href: Routes.TermsOfService, external: false },
        { title: 'Contact Support', href: Routes.Contact, external: false },
      ],
    },
  ];
}
