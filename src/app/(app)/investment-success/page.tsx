
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { ClientOnly } from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/helpers';
import { CheckCircle, Home, Receipt } from 'lucide-react';
import { Transaction } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useSound } from '@/hooks/use-sound';

const ReceiptRow = ({ label, value, className = '' }: { label: string, value: string, className?: string }) => (
    <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{label}</p>
        <p className={`font-medium text-foreground ${className}`}>{value}</p>
    </div>
);

export default function InvestmentSuccessPage() {
    const router = useRouter();
    const { user, loading, reloadUser } = useUser();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const playSuccessSound = useSound('https://files.catbox.moe/6fv876.wav');


    useEffect(() => {
        if (loading || !user) return;

        const txId = sessionStorage.getItem('last_investment_tx');
        if (!txId) {
            router.replace('/home');
            return;
        }

        const foundTx = user.transactions.find(t => t.id === txId);
        if (foundTx) {
            setTransaction(foundTx);
            playSuccessSound();
            reloadUser(); // reload user to get latest data after investment
        } else {
            router.replace('/history');
        }
        
        // Clean up session storage item
        return () => {
            sessionStorage.removeItem('last_investment_tx');
        }

    }, [user, loading, router, playSuccessSound, reloadUser]);

    const renderSkeleton = () => (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-px w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );

    if (loading || !transaction) {
        return (
             <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
                {renderSkeleton()}
            </div>
        );
    }
    
    const investment = user?.investments.find(inv => inv.planName === transaction.description);

    return (
        <ClientOnly>
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
                <Card className="w-full max-w-md mx-auto animate-fade-in-up">
                    <CardHeader className="text-center items-center gap-2">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <CardTitle className="text-2xl">Investment Successful!</CardTitle>
                        <CardDescription>Your investment has been confirmed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                            <ReceiptRow label="Plan Name" value={investment?.planName || ''} />
                            <ReceiptRow label="Amount Invested" value={formatCurrency(transaction.amount)} className="text-red-600" />
                            <ReceiptRow label="Expected Return" value={formatCurrency(investment?.expectedReturn || 0)} className="text-green-600" />
                            <ReceiptRow label="Duration" value={`${investment?.duration} days`} />
                        </div>
                        <Separator />
                        <ReceiptRow label="Date" value={format(new Date(transaction.date), 'dd MMM yyyy, hh:mm a')} />
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button className="w-full h-12 text-lg" onClick={() => router.push('/home')}>
                            <Home className="mr-2" /> Go to Home
                        </Button>
                         <Button variant="outline" className="w-full" onClick={() => router.push('/history')}>
                            <Receipt className="mr-2" /> View History
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </ClientOnly>
    );
}
