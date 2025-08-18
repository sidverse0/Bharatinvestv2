
'use client';

import BottomNav from '@/components/BottomNav';
import ActivityNotification from '@/components/ActivityNotification';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';
import { ClientOnly } from '@/components/ClientOnly';
import BannedScreen from '@/components/BannedScreen';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (user && user.isBanned) {
    return <BannedScreen />;
  }

  if (loading || !user) {
    return (
       <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="loading-spinner"></div>
            <BharatInvestLogo className="h-16 w-16" />
        </div>
      </div>
    )
  }

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
