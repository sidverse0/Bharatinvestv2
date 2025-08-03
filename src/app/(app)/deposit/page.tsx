'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { CheckCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DEPOSIT_AMOUNTS } from '@/lib/constants';
import { formatCurrency, openTelegramLink } from '@/lib/helpers';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ClientOnly';

const formSchema = z.object({
  utr: z.string().min(12, 'UTR/Transaction ID must be at least 12 characters.'),
});

type Step = 'select_amount' | 'submit_utr' | 'pending_approval';

export default function DepositPage() {
  const [step, setStep] = useState<Step>('select_amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, addTransaction } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { utr: '' },
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setStep('submit_utr');
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedAmount || !user) return;
    setIsLoading(true);

    const message = `DEPOSIT REQUEST\n\nUser: ${user.username}\nAmount: ${formatCurrency(selectedAmount)}\nUTR: ${values.utr}`;
    
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
          <Card>
            <CardHeader>
              <CardTitle>Select Deposit Amount</CardTitle>
              <CardDescription>Choose one of the preset amounts to deposit.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {DEPOSIT_AMOUNTS.map((amount) => (
                <Button key={amount} variant="outline" size="lg" className="h-16" onClick={() => handleAmountSelect(amount)}>
                  {formatCurrency(amount)}
                </Button>
              ))}
            </CardContent>
          </Card>
        );
      case 'submit_utr':
        return (
          <Card>
            <CardHeader>
              <Button variant="ghost" size="sm" className="absolute left-2 top-2" onClick={() => { setStep('select_amount'); form.reset(); }}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <CardTitle className="text-center pt-8">Complete Your Deposit</CardTitle>
              <CardDescription className="text-center">Scan the QR code and submit your transaction ID.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Image src="https://placehold.co/250x250.png" data-ai-hint="qr code" alt="QR Code" width={250} height={250} className="rounded-lg border-2 border-primary" />
              </div>
              <p className="text-center text-muted-foreground text-sm">Amount: <span className="font-bold text-foreground">{formatCurrency(selectedAmount!)}</span></p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="utr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTR / Transaction ID</FormLabel>
                        <FormControl>
                          <Input className="font-code text-center" placeholder="Enter 12-digit UTR" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Submit for Approval"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
      case 'pending_approval':
        return (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Waiting for Approval</CardTitle>
              <CardDescription>Your request has been sent. Please wait for the admin to confirm your deposit.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <CheckCircle className="h-24 w-24 text-green-500 animate-pulse" />
              <p className="text-muted-foreground">You can contact the admin on Telegram for a faster response.</p>
              <Button onClick={() => openTelegramLink(`Hi, I've submitted a deposit request for ${formatCurrency(selectedAmount!)}.`)}>Contact Admin</Button>
              <Button variant="outline" onClick={() => router.push('/home')}>Go to Home</Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-md p-4">
        {renderStep()}
      </div>
    </ClientOnly>
  );
}