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
      title: 'Resources',
      items: [{ title: 'Docs', href: Routes.Docs, external: false }],
    },
    {
      title: 'Legal',
      items: [
        { title: 'Cookie Policy', href: Routes.CookiePolicy, external: false },
        { title: 'Privacy Policy', href: Routes.PrivacyPolicy, external: false },
        { title: 'Terms of Service', href: Routes.TermsOfService, external: false },
      ],
    },
  ];
}
