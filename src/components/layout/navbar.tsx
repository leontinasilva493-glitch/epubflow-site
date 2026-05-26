'use client';

import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { LogoWordmark } from '@/components/layout/logo-wordmark';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { buttonVariants } from '@/components/ui/button';
import { useNavbarLinks } from '@/config/navbar-config';
import { useScroll } from '@/hooks/use-scroll';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, Upload } from 'lucide-react';

interface NavBarProps {
  scroll?: boolean;
}

export function Navbar({ scroll }: NavBarProps) {
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
            <Logo className="size-7 rounded-md" />
            <LogoWordmark className="h-7" />
          </LocaleLink>

          <div className="flex-1 flex items-center justify-center gap-7 text-sm font-medium text-muted-foreground">
            {links.map((item) =>
              item.items?.length ? (
                <div key={item.title} className="group relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    {item.title}
                    <ChevronDown className="size-4" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-background p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    {item.items.map((subItem) => (
                      <LocaleLink
                        key={`${item.title}-${subItem.title}-${subItem.href}`}
                        href={subItem.href || '#'}
                        className={cn(
                          'block rounded-md px-3 py-2 text-sm transition hover:bg-muted hover:text-foreground',
                          subItem.href &&
                            localePathname.startsWith(subItem.href) &&
                            'bg-muted text-foreground'
                        )}
                      >
                        {subItem.title}
                      </LocaleLink>
                    ))}
                  </div>
                </div>
              ) : (
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
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            <ModeSwitcher />
            <LocaleLink
              href="/#converter"
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
