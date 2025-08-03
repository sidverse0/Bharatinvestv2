
'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
  amount: z.coerce.number().min(MIN_WITHDRAWAL, `Minimum withdrawal amount is ${formatCurrency(MIN_WITHDRAWAL)}.`),
  upiId: z.string().min(5, 'Please enter a valid UPI ID.').regex(/@/, 'Please enter a valid UPI ID.'),
});

export default function WithdrawPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, addTransaction } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: MIN_WITHDRAWAL,
      upiId: '',
    },
  });

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
      description: `Withdrawal to ${values.upiId}`
    });
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Request Sent",
        description: "Your withdrawal request has been sent for approval. It may take a few minutes."
      });
      router.push('/history');
    }, 500);
  };

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Enter the amount and your UPI ID to request a withdrawal.</CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <div className="mb-4 text-sm text-muted-foreground">
                Available to withdraw: <span className="font-bold text-foreground">{formatCurrency(user.balance)}</span>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Request Withdrawal"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
