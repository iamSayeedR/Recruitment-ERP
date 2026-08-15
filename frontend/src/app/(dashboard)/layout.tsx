import { Providers } from '@/lib/providers';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Header } from '@/components/Header/Header';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getLocale, getMessages } from 'next-intl/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // If unauthenticated, redirect to signin page
  if (!session) {
    redirect('/auth/signin');
  }

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <Providers session={session} locale={locale} messages={messages}>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--color-bg)', color: 'var(--color-text)' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <Sidebar />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Header />
          <main style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}
