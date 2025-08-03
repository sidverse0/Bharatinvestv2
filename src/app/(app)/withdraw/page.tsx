
'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Wallet, ArrowLeft, Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MIN_WITHDRAWAL } from '@/lib/constants';
import { formatCurrency } from '@/lib/helpers';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ClientOnly';

const formSchema = z.object({
  name: z.string().min(3, 'Please enter your full name.'),
  bankName: z.string().min(3, 'Please enter a valid bank name.'),
  upiId: z.string().min(5, 'Please enter a valid UPI ID.').regex(/@/, 'Please enter a valid UPI ID.'),
  amount: z.coerce.number().min(MIN_WITHDRAWAL, `Minimum withdrawal amount is ${formatCurrency(MIN_WITHDRAWAL)}.`),
});

export default function WithdrawPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, addTransaction } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      bankName: '',
      upiId: '',
      amount: MIN_WITHDRAWAL,
    },
  });
  
  useEffect(() => {
    if (user) {
      form.setValue('name', user.name);
    }
  }, [user, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    if (values.amount > user.balance) {
      form.setError('amount', { type: 'manual', message: 'Insufficient balance.' });
      return;
    }
    setIsLoading(true);
    
    addTransaction({
      type: 'withdrawal',
      amount: values.amount,
      status: 'pending',
      description: `Withdrawal to ${values.bankName}`
    });
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: "Request Sent",
        description: "Your withdrawal request has been sent for approval."
      });
    }, 1000);
  };

  if (isSuccess) {
    return (
       <ClientOnly>
         <div className="container mx-auto max-w-md p-4 flex flex-col items-center justify-center min-h-[80vh]">
            <Card className="w-full text-center animate-fade-in-up">
                <CardHeader className="items-center">
                    <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                    <CardTitle className="text-2xl">Request Submitted!</CardTitle>
                    <CardDescription className="text-base px-4">
                        Your balance will be credited to your account within 24 hours.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button size="lg" className="w-full h-12 text-lg" onClick={() => router.push('/wallet')}>
                        <ArrowLeft className="mr-2" /> Back to Wallet
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={() => router.push('/history')}>
                        <Receipt className="mr-2" /> View History
                    </Button>
                </CardContent>
            </Card>
        </div>
       </ClientOnly>
    )
  }

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-md p-4 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-muted-foreground mt-1">Request a withdrawal to your bank account.</p>
        </header>
        
        {user && (
            <Card className="text-center bg-muted/30">
                <CardHeader>
                    <CardDescription className="flex items-center justify-center gap-2"><Wallet className="h-4 w-4" /> Available Balance</CardDescription>
                    <CardTitle className="text-4xl font-bold text-primary">{formatCurrency(user.balance)}</CardTitle>
                </CardHeader>
            </Card>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (as per bank)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. State Bank of India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input placeholder="yourname@bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Submit Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
