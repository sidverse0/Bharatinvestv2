
'use client';

import BottomNav from '@/components/BottomNav';
import ActivityNotification from '@/components/ActivityNotification';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Rely on the useUser hook for auth state
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [user, loading, router]);

  if (isCheckingAuth || loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
        <BharatInvestLogo className="h-16 w-auto" />
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-8" />
        <p className="mt-4 text-lg font-semibold text-foreground">Loading your dashboard...</p>
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <ActivityNotification />
      <main className="flex-grow pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
