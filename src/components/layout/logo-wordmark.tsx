'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-wordmark.png"
      alt="EPUBFlow"
      title="EPUBFlow"
      width={1024}
      height={512}
      priority
      className={cn('h-8 w-auto', className)}
    />
  );
}
