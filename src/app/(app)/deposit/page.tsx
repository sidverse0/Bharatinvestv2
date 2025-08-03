
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { CheckCircle, ChevronLeft, Loader2, AlertTriangle, Star, Flame, Award, Shield, Gem, Timer, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DEPOSIT_AMOUNTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/helpers';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ClientOnly';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


const formSchema = z.object({
  utr: z.string().min(12, 'UTR/Transaction ID must be at least 12 characters.'),
  confirmUtr: z.string()
}).refine(data => data.utr === data.confirmUtr, {
  message: "UTRs don't match",
  path: ["confirmUtr"],
});

type Step = 'select_amount' | 'submit_utr' | 'pending_approval' | 'times_up';

const TRANSACTION_WINDOW_SECONDS = 5 * 60; // 5 minutes
const APPROVAL_WINDOW_SECONDS = 2 * 60; // 2 minutes

const DepositAmountButton = ({ amount, onSelect }: { amount: number, onSelect: (amount: number) => void}) => {
  const tags: {[key: number]: {label: string, bonus: string, icon: React.ReactNode, color: string }} = {
    100: { label: 'Popular', bonus: '+₹10 Bonus', icon: <Star className="h-3 w-3" />, color: 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50' },
    200: { label: 'Recommended', bonus: '+₹20 Bonus', icon: <Award className="h-3 w-3" />, color: 'bg-blue-400/80 text-blue-900 border-blue-500/50' },
    400: { label: 'Hot', bonus: '+₹30 Bonus', icon: <Flame className="h-3 w-3" />, color: 'bg-red-500/80 text-white border-red-600/50' },
    600: { label: 'Best Value', bonus: '+₹40 Bonus', icon: <Shield className="h-3 w-3" />, color: 'bg-green-500/80 text-white border-green-600/50' },
    1000: { label: 'Pro', bonus: '+₹50 Bonus', icon: <Gem className="h-3 w-3" />, color: 'bg-purple-500/80 text-white border-purple-600/50' },
  }
  const tag = tags[amount];

  return (
    <Button 
      variant="outline" 
      size="lg" 
      className="h-24 text-lg relative flex flex-col items-center justify-center transition-all hover:scale-105" 
      onClick={() => onSelect(amount)}
    >
      {tag && (
        <Badge className={cn("absolute -top-2 -right-2 z-10 flex items-center gap-1 border shadow-lg", tag.color)}>
          {tag.icon} {tag.label}
        </Badge>
      )}
      <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
      {tag && <span className="text-sm font-semibold text-primary">{tag.bonus}</span>}
    </Button>
  );
};


export default function DepositPage() {
  const [step, setStep] = useState<Step>('select_amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TRANSACTION_WINDOW_SECONDS);
  const [approvalTimeLeft, setApprovalTimeLeft] = useState(APPROVAL_WINDOW_SECONDS);
  const [showApprovalToast, setShowApprovalToast] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const approvalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { user, addTransaction, reloadUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { utr: '', confirmUtr: '' },
  });
  
  useEffect(() => {
    if (showApprovalToast) {
       toast({
        title: "Request Sent",
        description: "Your deposit request has been sent to the admin for approval."
      })
      setShowApprovalToast(false); // Reset the trigger
    }
  }, [showApprovalToast, toast]);


  const stopTimer = (timerToStop: 'transaction' | 'approval' | 'both') => {
    if ((timerToStop === 'transaction' || timerToStop === 'both') && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if ((timerToStop === 'approval' || timerToStop === 'both') && approvalTimerRef.current) {
        clearInterval(approvalTimerRef.current);
        approvalTimerRef.current = null;
    }
  };

  const startTransactionTimer = () => {
    stopTimer('both');
    setTimeLeft(TRANSACTION_WINDOW_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer('transaction');
          setStep('times_up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const startApprovalTimer = () => {
    stopTimer('both');
    setApprovalTimeLeft(APPROVAL_WINDOW_SECONDS);
    approvalTimerRef.current = setInterval(() => {
        setApprovalTimeLeft((prev) => {
            if (prev <= 1) {
                stopTimer('approval');
                reloadUser(); // Force user data refresh
                toast({ title: 'Deposit Approved!', description: 'Your balance has been updated.' });
                router.replace('/history');
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  };
  
  useEffect(() => {
    return () => stopTimer('both'); // Cleanup timers on component unmount
  }, []);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setStep('submit_utr');
    startTransactionTimer();
  };

  const handleBack = () => {
    stopTimer('transaction');
    setStep('select_amount');
    form.reset();
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedAmount || !user) return;
    setIsLoading(true);
    stopTimer('transaction');
    
    addTransaction({
      type: 'deposit',
      amount: selectedAmount,
      status: 'pending',
      description: `Deposit request`
    });
    
    setTimeout(() => {
      setStep('pending_approval');
      startApprovalTimer();
      setIsLoading(false);
      setShowApprovalToast(true);
    }, 1000);
  };

  const renderApprovalTimer = () => {
    const minutes = Math.floor(approvalTimeLeft / 60);
    const seconds = approvalTimeLeft % 60;
    const progress = (APPROVAL_WINDOW_SECONDS - approvalTimeLeft) / APPROVAL_WINDOW_SECONDS * 100;
    
    return (
       <div className="w-full max-w-sm text-center">
            <div className="relative mb-4">
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-pulse mb-6" />
                <h1 className="text-3xl font-bold tracking-tight">Waiting for Approval</h1>
                <p className="text-muted-foreground mt-2">Your deposit will be automatically approved.</p>
                <p className="text-sm font-semibold text-destructive mt-1">Please do not press back or close the app.</p>
            </div>
            
            <Card className="bg-muted/50 p-4">
                <div className="flex items-center justify-center gap-2 text-center font-mono text-2xl p-3 bg-background/50 text-foreground rounded-md w-full shadow-inner">
                    <Clock className="h-7 w-7" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
                 <p className="text-xs text-muted-foreground mt-3">Time until balance is updated</p>
                 <Progress value={progress} className="w-full mt-2 h-2" />
            </Card>

            <Button size="lg" variant="outline" className="h-12 text-lg mt-8 w-full" onClick={() => router.push('/home')}>
                Go to Home
            </Button>
       </div>
    );
  };
  
  const renderStep = () => {
    switch (step) {
      case 'select_amount':
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Select Deposit Amount</h1>
            <p className="text-muted-foreground mt-2">Choose one of the preset amounts to deposit.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {DEPOSIT_AMOUNTS.map((amount) => (
                <DepositAmountButton key={amount} amount={amount} onSelect={handleAmountSelect} />
              ))}
            </div>
          </div>
        );
      case 'submit_utr':
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return (
          <div>
            <Button variant="ghost" size="sm" className="absolute -top-4 -left-2 md:relative md:top-auto md:left-auto md:-ml-4 md:mb-4" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Scan QR</h1>
                <p className="text-muted-foreground mt-2">Scan the QR code and submit your transaction ID.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4 mt-8">
                <Image src="https://placehold.co/250x250.png" data-ai-hint="qr code" alt="QR Code" width={250} height={250} className="rounded-lg border-2 border-primary" />
                <div className="flex items-center justify-center gap-2 text-center font-mono text-2xl p-3 bg-destructive/10 text-destructive rounded-md w-full ring-2 ring-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    <Timer className="h-7 w-7" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
                <p className="text-center text-muted-foreground text-base">Amount to Pay: <span className="font-bold text-foreground">{formatCurrency(selectedAmount!)}</span></p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
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
                <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Submit for Approval"}
                </Button>
              </form>
            </Form>
          </div>
        );
      case 'pending_approval':
        return (
          <div className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
              {renderApprovalTimer()}
          </div>
        );
      case 'times_up':
        return (
          <AlertDialog open={true}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="h-16 w-16 text-destructive" />
                </div>
                <AlertDialogTitle className="text-center text-2xl">Time's Up!</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  The 5-minute window for this transaction has expired. Please try again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='sm:justify-center'>
                <AlertDialogAction onClick={handleBack}>Go Back</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
    }
  };

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-md p-4 pt-8">
        {renderStep()}
      </div>
    </ClientOnly>
  );
}
