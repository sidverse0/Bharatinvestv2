'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
