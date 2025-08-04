
'use client';

import BottomNav from '@/components/BottomNav';
import ActivityNotification from '@/components/ActivityNotification';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="loading-spinner"></div>
            <BharatInvestLogo className="h-16 w-16" />
        </div>
        <p className="mt-6 text-xl font-bold text-foreground animate-fade-in-up">Loading your dashboard...</p>
        <p className="text-muted-foreground animate-fade-in-up animation-delay-[150ms]">Please wait a moment.</p>
      </div>
    );
  }

  // Render children only if user is logged in
  return user ? (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <ActivityNotification />
      <main className="flex-grow pb-24">{children}</main>
      <BottomNav />
    </div>
  ) : null;
}
