
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { CheckCircle, ChevronLeft, Loader2, AlertTriangle, Star, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DEPOSIT_AMOUNTS } from '@/lib/constants';
import { formatCurrency, openTelegramLink } from '@/lib/helpers';
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

const formSchema = z.object({
  utr: z.string().min(12, 'UTR/Transaction ID must be at least 12 characters.'),
  confirmUtr: z.string()
}).refine(data => data.utr === data.confirmUtr, {
  message: "UTRs don't match",
  path: ["confirmUtr"],
});

type Step = 'select_amount' | 'submit_utr' | 'pending_approval' | 'times_up';

const FIVE_MINUTES = 5 * 60;

const DepositAmountButton = ({ amount, onSelect }: { amount: number, onSelect: (amount: number) => void}) => {
  const tags: {[key: number]: {label: string, icon: React.ReactNode}} = {
    100: { label: 'Popular', icon: <Star className="h-3 w-3" /> },
    400: { label: 'Hot', icon: <Flame className="h-3 w-3" /> },
  }
  const tag = tags[amount];

  return (
    <Button 
      variant="outline" 
      size="lg" 
      className="h-20 text-lg relative flex flex-col items-center justify-center" 
      onClick={() => onSelect(amount)}
    >
      {tag && (
        <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground flex items-center gap-1">
          {tag.icon} {tag.label}
        </Badge>
      )}
      <span>{formatCurrency(amount)}</span>
    </Button>
  );
};


export default function DepositPage() {
  const [step, setStep] = useState<Step>('select_amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FIVE_MINUTES);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { user, addTransaction } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { utr: '', confirmUtr: '' },
  });

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    setTimeLeft(FIVE_MINUTES);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setStep('times_up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  useEffect(() => {
    return () => stopTimer(); // Cleanup timer on component unmount
  }, []);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setStep('submit_utr');
    startTimer();
  };

  const handleBack = () => {
    stopTimer();
    setStep('select_amount');
    form.reset();
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedAmount || !user) return;
    setIsLoading(true);
    stopTimer();

    const message = `DEPOSIT REQUEST\n\nUser: ${user.name}\nAmount: ${formatCurrency(selectedAmount)}\nUTR: ${values.utr}`;
    
    addTransaction({
      type: 'deposit',
      amount: selectedAmount,
      status: 'pending',
      description: `Deposit request, UTR: ${values.utr}`
    });

    openTelegramLink(message);
    
    setTimeout(() => {
      setStep('pending_approval');
      setIsLoading(false);
      toast({
        title: "Request Sent",
        description: "Your deposit request has been sent to the admin for approval."
      })
    }, 1000);
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
          <div className="relative">
            <Button variant="ghost" size="sm" className="absolute -left-2 -top-4" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Complete Your Deposit</h1>
                <p className="text-muted-foreground mt-2">Scan the QR code and submit your transaction ID.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4 mt-8">
                <Image src="https://placehold.co/250x250.png" data-ai-hint="qr code" alt="QR Code" width={250} height={250} className="rounded-lg border-2 border-primary" />
                <div className="text-center font-mono text-2xl p-3 bg-destructive/10 text-destructive rounded-md w-full">
                    Time Remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
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
          <div className="text-center flex flex-col items-center justify-center min-h-[60vh]">
              <CheckCircle className="h-24 w-24 text-green-500 animate-pulse mb-6" />
              <h1 className="text-3xl font-bold tracking-tight">Waiting for Approval</h1>
              <p className="text-muted-foreground mt-2 max-w-sm">Your request has been sent. Please wait for the admin to confirm your deposit.</p>
              <div className="mt-8 flex flex-col gap-4 w-full">
                 <Button size="lg" className="h-12 text-lg" onClick={() => openTelegramLink(`Hi, I've submitted a deposit request for ${formatCurrency(selectedAmount!)}.`)}>Contact Admin</Button>
                <Button size="lg" variant="outline" className="h-12 text-lg" onClick={() => router.push('/home')}>Go to Home</Button>
              </div>
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
                  The 5-minute window for this transaction has expired. Please try again. If you already paid, contact your agent.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='sm:justify-center'>
                 <Button variant="outline" onClick={() => openTelegramLink('Hi, my deposit timer ran out.')}>Contact Agent</Button>
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
