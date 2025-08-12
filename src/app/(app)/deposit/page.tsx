
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, Timer, AlertTriangle, ArrowRight, Wallet, Camera, ClipboardCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { Separator } from '@/components/ui/separator';
import { Card, CardTitle } from '@/components/ui/card';


type Step = 'select_amount' | 'make_payment' | 'times_up';

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


export default function DepositPage() {
  const [step, setStep] = useState<Step>('select_amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TRANSACTION_WINDOW_SECONDS);

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

  const handleBack = () => {
    stopTimer();
    setStep('select_amount');
  }

  const proceedToConfirmation = () => {
    stopTimer();
    // Pass amount to the confirmation page
    router.push(`/deposit/confirm?amount=${selectedAmount}`);
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
                    <StepIndicator step={3} icon={<ClipboardCheck className="h-6 w-6"/>} title="Step 3: Confirm" description="Enter the UTR on the final screen." />
                </div>
            </Card>
          </div>
        );
      case 'make_payment':
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const upiLink = `upi://pay?pa=${PAYEE_UPI_ID}&pn=${PAYEE_NAME}&am=${selectedAmount}&cu=INR&tn=Deposit%20for%20BharatInvest`;
        const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;
        
        return (
          <div>
            <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
                <ChevronLeft /> Back
            </Button>
            
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Make Your Payment</h1>
            </div>
            
            <div className="flex flex-col items-center gap-4 mt-6">
                <Image src="https://files.catbox.moe/dd0hv5.png" data-ai-hint="qr code" alt="QR Code" width={250} height={250} className="rounded-lg border-2 border-primary shadow-[0_0_20px_hsl(var(--primary))]" />
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
                 <Button size="lg" className="w-full h-14" onClick={proceedToConfirmation}>
                    I have paid, Next Step <ArrowRight className="ml-2" />
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
