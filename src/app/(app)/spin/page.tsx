
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the new /treasure page
export default function OldSpinPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/treasure');
  }, [router]);

  return null;
}
