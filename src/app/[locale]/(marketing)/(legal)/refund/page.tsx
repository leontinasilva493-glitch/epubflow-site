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
    title: `Refund Policy | ${t('title')}`,
    description:
      'EPUBFlow refund policy for conversion service, support response windows, and billing dispute handling.',
    locale,
    pathname: '/refund',
  });
}

export default function RefundPolicyPage() {
  return (
    <Container className="py-14 px-4">
      <article className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
        <p className="text-muted-foreground">
          EPUBFlow is currently in MVP stage. If you are charged unexpectedly or
          encounter billing issues, contact support and we will review your case
          promptly.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">How refunds are handled</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Submit your request within 7 days of the charge.</li>
            <li>Include account email, charge date, and issue summary.</li>
            <li>We respond within 48 hours.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Email: <a className="text-[#ef3f0a] underline" href="mailto:support@epubflow.org">support@epubflow.org</a>
          </p>
        </section>
      </article>
    </Container>
  );
}
