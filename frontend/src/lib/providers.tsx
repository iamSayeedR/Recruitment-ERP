'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useTenantStore } from '@/stores/tenant-store';

export function Providers({ children, session, locale, messages }: { children: React.ReactNode, session?: any, locale: string, messages: any }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  }));

  useEffect(() => {
    // Automatically re-apply persisted tenant branding colors on mount across sessions and signins
    useTenantStore.getState().applyBranding();
  }, []);

  return (
    <SessionProvider session={session}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
