import { getLocalePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import type { MetadataRoute } from 'next';
import type { Locale } from 'next-intl';
import { getBaseUrl } from '../lib/urls/urls';

type Href = Parameters<typeof getLocalePathname>[0]['href'];

const staticRoutes: Href[] = [
  // Keep only canonical page routes here.
  // Do not add hash-anchor routes such as "/#faqs" or "/#features".
  '/',
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/cookie',
  '/refund',
  '/data-retention',
  '/epub-to-pdf',
  '/epub-to-kindle',
  '/epub-to-markdown',
  '/epub-to-txt',
  '/epub-to-docx',
  '/guides/mobi-vs-azw3-vs-epub',
  '/guides/best-ebook-format-for-kindle',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: getUrl(route, locale),
      lastModified: new Date(),
    }))
  );
}

function getUrl(href: Href, locale: Locale) {
  const pathname = getLocalePathname({ locale, href });
  return getBaseUrl() + pathname;
}
