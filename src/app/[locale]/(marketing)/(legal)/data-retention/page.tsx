import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return constructMetadata({
    title: `Data Retention | ${t('title')}`,
    description:
      'EPUBFlow data retention and deletion policy for uploaded files and conversion outputs.',
    locale,
    pathname: '/data-retention',
  });
}

export default function DataRetentionPage() {
  return (
    <Container className="py-14 px-4">
      <article className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Data Retention & Deletion
        </h1>
        <p className="text-muted-foreground">
          EPUBFlow is private by default. We process uploaded EPUB files for conversion only.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">File lifecycle</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Upload over HTTPS (encrypted in transit).</li>
            <li>Temporary processing for conversion.</li>
            <li>Output file generated for user download.</li>
            <li>Input and output files are auto-deleted after 1 hour.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">AI usage</h2>
          <p className="text-muted-foreground">
            We do not use uploaded ebooks to train AI models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">DRM-protected files</h2>
          <p className="text-muted-foreground">
            DRM-protected ebooks are not supported. We do not provide DRM decryption.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Support</h2>
          <p className="text-muted-foreground">
            For deletion or privacy requests, contact{' '}
            <a className="text-[#ef3f0a] underline" href="mailto:support@epubflow.org">
              support@epubflow.org
            </a>
            .
          </p>
        </section>
      </article>
    </Container>
  );
}
