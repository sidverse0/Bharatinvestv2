
'use client';

import BottomNav from '@/components/BottomNav';
import ActivityNotification from '@/components/ActivityNotification';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';
import { ClientOnly } from '@/components/ClientOnly';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Render children only if user is logged in
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <ClientOnly>
        <ActivityNotification />
      </ClientOnly>
      <main className="flex-grow pb-24">{children}</main>
      <ClientOnly>
        <BottomNav />
      </ClientOnly>
    </div>
  )
}
