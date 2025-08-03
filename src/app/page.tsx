'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';

// This is the root page. It will check for an active session
// and redirect the user to either the login page or the home page.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionName = localStorage.getItem('bharatinvest_session');
    if (sessionName) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Display a loader while the redirection is happening.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
      <BharatInvestLogo className="h-16 w-16" />
      <Loader2 className="h-8 w-8 animate-spin text-primary mt-8" />
      <p className="mt-4 text-lg font-semibold text-foreground">Securing your session...</p>
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
