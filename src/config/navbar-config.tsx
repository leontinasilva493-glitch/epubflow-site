'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';

/**
 * Keep navbar minimal for the static v1 landing.
 */
export function useNavbarLinks(): NestedMenuItem[] {
  return [
    {
      title: 'Features',
      href: Routes.Features,
      external: false,
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
    {
      title: 'Docs',
      href: Routes.Docs,
      external: false,
    },
  ];
}
