
'use client';

import { Ban } from 'lucide-react';
import { Button } from './ui/button';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function BannedScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
                <Ban className="h-16 w-16 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-destructive">Account Suspended</h1>
            <p className="mt-2 max-w-md text-lg text-muted-foreground">
                Your account has been suspended due to a violation of our terms and conditions.
            </p>
            <p className="mt-1 max-w-md text-base text-muted-foreground">
                Please contact customer support for further information.
            </p>
            <Button variant="destructive" onClick={handleLogout} className="mt-8">
                Log Out
            </Button>
        </div>
    );
}
