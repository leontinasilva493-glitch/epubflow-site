'use client';

import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { buttonVariants } from '@/components/ui/button';
import { useNavbarLinks } from '@/config/navbar-config';
import { useScroll } from '@/hooks/use-scroll';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NavBarProps {
  scroll?: boolean;
}

export function Navbar({ scroll }: NavBarProps) {
  const t = useTranslations();
  const scrolled = useScroll(50);
  const links = useNavbarLinks();
  const localePathname = useLocalePathname();

  return (
    <section
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
        scroll
          ? scrolled
            ? 'bg-white/90 backdrop-blur-md border-b'
            : 'bg-transparent'
          : 'border-b bg-white/90'
      )}
    >
      <Container className="px-4">
        <nav className="hidden lg:flex items-center">
          <LocaleLink href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="text-xl font-semibold">{t('Metadata.name')}</span>
          </LocaleLink>

          <div className="flex-1 flex items-center justify-center gap-7 text-sm font-medium text-muted-foreground">
            {links.map((item) => (
              <LocaleLink
                key={`${item.title}-${item.href}`}
                href={item.href || '#'}
                className={cn(
                  'transition-colors hover:text-foreground',
                  item.href && localePathname === item.href && 'text-foreground'
                )}
              >
                {item.title}
              </LocaleLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ModeSwitcher />
            <LocaleLink
              href="/"
              className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
            >
              <Upload className="size-4" />
              Convert EPUB Now
            </LocaleLink>
          </div>
        </nav>

        <NavbarMobile className="lg:hidden" />
      </Container>
    </section>
  );
}
