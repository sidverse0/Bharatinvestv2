
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, Home, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ClientOnly';
import { Progress } from '@/components/ui/progress';
import { useSound } from '@/hooks/use-sound';
import { formatCurrency } from '@/lib/helpers';

const formSchema = z.object({
  name: z.string().min(3, 'Please enter your full name.'),
  utr: z.string().length(12, 'UTR/Transaction ID must be 12 characters.'),
  confirmUtr: z.string()
}).refine(data => data.utr === data.confirmUtr, {
  message: "UTRs don't match",
  path: ["confirmUtr"],
});

type Step = 'submit_utr' | 'pending_approval';
const APPROVAL_WINDOW_SECONDS = 2 * 60; // 2 minutes

function DepositConfirmContent() {
    const [step, setStep] = useState<Step>('submit_utr');
    const [isLoading, setIsLoading] = useState(false);
    const [approvalTimeLeft, setApprovalTimeLeft] = useState(APPROVAL_WINDOW_SECONDS);
    const [pendingTxId, setPendingTxId] = useState<string | null>(null);
    const [showRequestSentToast, setShowRequestSentToast] = useState(false);
    const [depositAmount, setDepositAmount] = useState<number>(0);

    const playSuccessSound = useSound('https://files.catbox.moe/6fv876.wav');
    const approvalTimerRef = useRef<NodeJS.Timeout | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const { addTransaction, reloadUser, removeTransaction } = useUser();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', utr: '', confirmUtr: '' },
    });

    useEffect(() => {
        const amount = searchParams.get('amount');
        if (!amount || isNaN(Number(amount))) {
            // If no amount, redirect back to start of deposit flow
            router.replace('/deposit');
        } else {
            setDepositAmount(Number(amount));
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (showRequestSentToast) {
            toast({
                title: "Request Sent",
                description: "Your deposit request has been sent for approval."
            });
            setShowRequestSentToast(false);
        }
    }, [showRequestSentToast, toast]);
    
    useEffect(() => {
        return () => {
            if (approvalTimerRef.current) {
                clearInterval(approvalTimerRef.current);
            }
        };
    }, []);

    const startApprovalTimer = () => {
        setApprovalTimeLeft(APPROVAL_WINDOW_SECONDS);
        approvalTimerRef.current = setInterval(() => {
            setApprovalTimeLeft((prev) => {
                if (prev <= 1) {
                    if(approvalTimerRef.current) clearInterval(approvalTimerRef.current);
                    reloadUser();
                    toast({ title: 'Deposit Approved!', description: 'Your balance has been updated.' });
                    router.replace('/home');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        const txId = await addTransaction({
            type: 'deposit',
            amount: depositAmount,
            status: 'pending',
            description: `Deposit request by ${values.name}`
        });

        if (txId) {
            setPendingTxId(txId);
            setStep('pending_approval');
            playSuccessSound();
            startApprovalTimer();
            setShowRequestSentToast(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to submit deposit request. Please try again.'
            });
        }
        setIsLoading(false);
    };

    const renderApprovalTimer = () => {
        const minutes = Math.floor(approvalTimeLeft / 60);
        const seconds = approvalTimeLeft % 60;
        const progress = (APPROVAL_WINDOW_SECONDS - approvalTimeLeft) / APPROVAL_WINDOW_SECONDS * 100;
        
        return (
           <div className="w-full max-w-sm text-center">
                <div className="relative mb-6">
                    <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-primary/10 mb-6 shadow-[0_0_20px] shadow-primary/20">
                        <CheckCircle className="h-20 w-20 text-primary animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Waiting for Approval</h1>
                    <p className="text-muted-foreground mt-2">Your deposit will be automatically approved.</p>
                    <p className="text-sm font-semibold text-destructive mt-1">Please do not press back or close the app.</p>
                </div>
                
                <Card className="bg-muted/30 p-4">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-center gap-2 text-center font-mono text-3xl p-3 bg-background/50 text-foreground rounded-md w-full shadow-inner">
                            <Clock className="h-8 w-8" />
                            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                        </div>
                         <p className="text-xs text-muted-foreground mt-3">Time until balance is updated</p>
                         <Progress value={progress} className="w-full mt-2 h-2" />
                    </CardContent>
                </Card>

                <Button size="lg" className="h-12 text-lg mt-8 w-full" onClick={() => {
                    if (pendingTxId) removeTransaction(pendingTxId);
                    setPendingTxId(null);
                    if(approvalTimerRef.current) clearInterval(approvalTimerRef.current);
                    router.push('/home')
                }}>
                    <Home className="mr-2" /> Go to Home
                </Button>
           </div>
        );
      };

    if (step === 'pending_approval') {
        return (
            <div className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
                {renderApprovalTimer()}
            </div>
        );
    }
    
    if(!depositAmount) {
        return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Confirm Your Deposit</h1>
                <p className="text-muted-foreground mt-2">Please provide your details to confirm your deposit of <span className="font-bold text-primary">{formatCurrency(depositAmount)}</span>.</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="utr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UTR / Transaction ID</FormLabel>
                      <FormControl>
                        <Input className="font-code text-center text-base" placeholder="Enter 12-digit UTR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmUtr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm UTR</FormLabel>
                      <FormControl>
                        <Input className="font-code text-center text-base" placeholder="Re-enter UTR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="accent" size="lg" className="w-full text-lg h-12" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Submit for Approval"}
                </Button>
              </form>
            </Form>
        </div>
    )
}


export default function DepositConfirmPage() {
    return (
        <ClientOnly>
            <div className="container mx-auto max-w-md p-4 pt-8">
                <Suspense fallback={<div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                    <DepositConfirmContent />
                </Suspense>
            </div>
        </ClientOnly>
    );
}
