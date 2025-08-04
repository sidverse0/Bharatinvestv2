
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';

// This is the root page. It will check for an active session
// and redirect the user to either the login page or the home page.
export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Display a loader while checking auth state.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="loading-spinner"></div>
            <BharatInvestLogo className="h-16 w-16" />
        </div>
        <p className="mt-6 text-xl font-bold text-foreground animate-fade-in-up">Securing your session...</p>
        <p className="text-muted-foreground animate-fade-in-up animation-delay-[150ms]">Please wait a moment.</p>
      </div>
  );
}
