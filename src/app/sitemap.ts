import { getLocalePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import type { MetadataRoute } from 'next';
import type { Locale } from 'next-intl';
import { getBaseUrl } from '../lib/urls/urls';

type Href = Parameters<typeof getLocalePathname>[0]['href'];

const staticRoutes: Href[] = [
  '/',
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/cookie',
  '/refund',
  '/data-retention',
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
