
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { ClientOnly } from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/helpers';
import { CheckCircle, Home, FileQuestion } from 'lucide-react';
import { Transaction } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useSound } from '@/hooks/use-sound';
import Image from 'next/image';

const ReceiptRow = ({ label, value, className = '' }: { label: string, value: string | undefined, className?: string }) => (
    <div className="flex justify-between items-center text-sm py-1.5">
        <p className="text-muted-foreground">{label}</p>
        <p className={`font-medium text-foreground text-right ${className}`}>{value || 'N/A'}</p>
    </div>
);


const ReceiptPageSkeleton = () => (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
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
                 <Skeleton className="h-48 w-full rounded-lg" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    </div>
);


export default function ReceiptPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading } = useUser();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const playSuccessSound = useSound('https://files.catbox.moe/6fv876.wav');

    const txId = params.txId as string;

    useEffect(() => {
        if (loading || !user) return;
        
        const foundTx = user.transactions.find(t => t.id === txId);

        if (foundTx) {
            if (foundTx.type !== 'withdrawal' || foundTx.status !== 'success') {
                router.replace('/history');
                return;
            }
            setTransaction(foundTx);
            playSuccessSound();
        } else if (!loading) {
            router.replace('/history');
        }

    }, [user, loading, router, txId, playSuccessSound]);

    if (loading || !transaction) {
        return <ReceiptPageSkeleton />;
    }

    return (
        <ClientOnly>
            <div className="container mx-auto max-w-md p-4 flex flex-col h-[calc(100vh-4rem)]">
                <header className="text-center pt-6 pb-4 flex-shrink-0">
                     <div className="relative inline-block">
                        <CheckCircle className="h-20 w-20 text-green-500" />
                        <div className="absolute inset-0 animate-ping rounded-full bg-green-500/50 -z-10"></div>
                    </div>
                    <h1 className="text-2xl font-bold mt-2">Payment Verified!</h1>
                    <p className="text-muted-foreground">This withdrawal has been successfully processed.</p>
                </header>
                
                <main className="flex-grow flex flex-col space-y-4 overflow-y-auto py-2">
                    <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-2">
                            <ReceiptRow label="Amount" value={formatCurrency(transaction.amount)} className="text-lg font-bold text-red-500" />
                            <Separator />
                            <ReceiptRow label="Date & Time" value={format(new Date(transaction.date), 'dd MMM yyyy, hh:mm a')} />
                            <ReceiptRow label="Transaction ID" value={transaction.id} />
                            <ReceiptRow label="Status" value="Success" className="text-green-600 font-bold" />
                        </CardContent>
                    </Card>
                    
                    <Card className="flex-grow flex flex-col">
                        <CardContent className="p-2 flex-grow">
                            {transaction.receiptImageUrl ? (
                                <Image 
                                    src={transaction.receiptImageUrl} 
                                    alt="Payment Receipt" 
                                    width={400} 
                                    height={400} 
                                    className="rounded-md w-full h-full object-contain"
                                    data-ai-hint="payment receipt"
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-muted rounded-md text-muted-foreground">
                                    <FileQuestion className="h-12 w-12 mb-2" />
                                    <p className="font-semibold">Receipt Not Available</p>
                                    <p className="text-xs">The receipt for this transaction has not been uploaded.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </ClientOnly>
    );
}

