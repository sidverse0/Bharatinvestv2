
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Timer, AlertTriangle, Wallet, Camera, ClipboardCheck, Clock, Home, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { DEPOSIT_AMOUNTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/helpers';
import { ClientOnly } from '@/components/ClientOnly';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import DepositAmountButton from '@/components/DepositAmountButton';
import { Card, CardTitle, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';


type Step = 'select_amount' | 'make_payment' | 'times_up' | 'pending_approval';

const TRANSACTION_WINDOW_SECONDS = 5 * 60; // 5 minutes
const PAYEE_UPI_ID = '9109664308@ybl';
const PAYEE_NAME = 'BharatInvest';
const WHATSAPP_NUMBER = '93720016849';

const StepIndicator = ({ step, icon, title, description }: { step: number; icon: React.ReactNode; title: string; description: string }) => (
    <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md">
                {icon}
            </div>
        </div>
        <div>
            <p className="font-semibold text-lg text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const ReceiptRow = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);


export default function DepositPage() {
  const [step, setStep] = useState<Step>('select_amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TRANSACTION_WINDOW_SECONDS);
  
  const { user, addTransaction, reloadUser } = useUser();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);


  const startTransactionTimer = () => {
    stopTimer();
    setTimeLeft(TRANSACTION_WINDOW_SECONDS);
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
  
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setStep('make_payment');
    startTransactionTimer();
  };

  const handleBackToSelection = () => {
    stopTimer();
    setStep('select_amount');
  }

  const handleSubmitForApproval = async () => {
    if (!selectedAmount || !user) return;
    
    stopTimer();

    await addTransaction({
        type: 'deposit',
        amount: selectedAmount,
        status: 'pending',
        description: 'Deposit request'
    });

    reloadUser();
    
    toast({
        title: "Request Sent",
        description: "Your deposit request has been sent for approval."
    });

    setStep('pending_approval');
  };

  const renderStep = () => {
    switch (step) {
      case 'select_amount':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Select Deposit Amount</h1>
              <p className="text-muted-foreground mt-2">Choose one of the preset amounts to deposit.</p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {DEPOSIT_AMOUNTS.map((amount) => (
                  <DepositAmountButton key={amount} amount={amount} onSelect={handleAmountSelect} />
                ))}
              </div>
            </div>

            <Card className="p-4 bg-muted/30">
                <CardTitle className="text-xl font-bold mb-4 text-center">How to Deposit</CardTitle>
                 <div className="space-y-4">
                    <StepIndicator step={1} icon={<Wallet className="h-6 w-6"/>} title="Step 1: Pay Now" description="Use the button on the next screen or scan the QR." />
                    <StepIndicator step={2} icon={<Camera className="h-6 w-6"/>} title="Step 2: Send Screenshot" description="Send payment proof on WhatsApp." />
                    <StepIndicator step={3} icon={<ClipboardCheck className="h-6 w-6"/>} title="Step 3: Submit Appeal" description="Submit your request after payment." />
                </div>
            </Card>
          </div>
        );
      case 'make_payment':
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const upiLink = `upi://pay?pa=${PAYEE_UPI_ID}&pn=${PAYEE_NAME}&am=${selectedAmount}&cu=INR&tn=Deposit for BharatInvest`;
        const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;
        
        return (
          <div>
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Make Your Payment</h1>
            </div>
            
            <div className="flex flex-col items-center gap-4 mt-6">
                <div className="p-4 bg-white rounded-lg border-2 border-primary shadow-[0_0_20px_hsl(var(--primary))]">
                  <Image src="https://placehold.co/250x250.png" data-ai-hint="qr code" alt="QR Code" width={250} height={250} className="rounded-lg" />
                </div>
                <div className="flex items-center justify-center gap-2 text-center font-mono text-2xl p-3 bg-destructive/10 text-destructive rounded-md w-full ring-2 ring-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    <Timer className="h-7 w-7" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
                <p className="text-center text-muted-foreground text-base">Amount to Pay: <span className="font-bold text-foreground">{formatCurrency(selectedAmount!)}</span></p>
            </div>

            <div className="space-y-4 mt-8">
                <a href={upiLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="accent" size="lg" className="w-full text-lg h-14">
                        Pay Now
                    </Button>
                </a>
                 <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="secondary" size="lg" className="w-full text-lg h-14">
                        <Camera className="mr-2" /> Send Payment Proof
                    </Button>
                </a>
                 <Button size="lg" className="w-full h-14" onClick={handleSubmitForApproval}>
                    Submit for Approval <ArrowRight className="ml-2" />
                </Button>
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
                  The 5-minute window for this transaction has expired. Please try again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='sm:justify-center'>
                <AlertDialogAction onClick={handleBackToSelection}>Go Back</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
       case 'pending_approval':
        return (
           <div className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
               <Card className="w-full max-w-sm animate-fade-in-up">
                <CardHeader className="items-center text-center">
                    <div className="relative mb-2">
                        <Clock className="h-20 w-20 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Waiting for Approval</CardTitle>
                    <CardDescription className="text-base px-4">
                        Your deposit request has been sent. An agent will approve it within 15-20 minutes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <ReceiptRow label="Amount" value={formatCurrency(selectedAmount || 0)} />
                        <Separator />
                        <ReceiptRow label="Recipient Name" value={user?.name} />
                        <Separator />
                        <ReceiptRow label="Date & Time" value={format(new Date(), 'dd MMM yyyy, hh:mm a')} />
                    </div>
                </CardContent>
                <div className="p-4 pt-0">
                    <Button size="lg" className="w-full h-12 text-lg" onClick={() => router.push('/home')}>
                        <Home className="mr-2" /> Go to Home
                    </Button>
                </div>
            </Card>
        </div>
        );
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
