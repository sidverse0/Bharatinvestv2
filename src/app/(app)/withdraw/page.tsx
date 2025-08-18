
'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Wallet, ArrowLeft, Receipt, Lightbulb, BadgeCheck, ShieldAlert, KeyRound, Banknote } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MIN_WITHDRAWAL } from '@/lib/constants';
import { formatCurrency } from '@/lib/helpers';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ClientOnly';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSound } from '@/hooks/use-sound';
import Link from 'next/link';

const formSchema = z.object({
  pin: z.string().length(4, 'PIN must be 4 digits.').regex(/^\d+$/, 'PIN must be numeric.'),
  amount: z.coerce.number().min(MIN_WITHDRAWAL, `Minimum withdrawal amount is ${formatCurrency(MIN_WITHDRAWAL)}.`),
});

interface WithdrawalDetails {
  amount: number;
  name: string;
  upiId: string;
  date: Date;
}

const ReceiptRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);

const PreWithdrawalCheck = ({ user }: { user: any }) => (
    <div className="container mx-auto max-w-md p-4 flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="w-full text-center">
            <CardHeader>
                 <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-2">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                 </div>
                <CardTitle className="text-2xl">Security Setup Required</CardTitle>
                <CardDescription>
                    To protect your account, you need to link a bank account and set a withdrawal PIN before you can make a withdrawal.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {!user.linkedBankAccount && (
                     <Link href="/bind-bank-account" passHref>
                        <Button className="w-full" variant="accent"><Banknote className="mr-2" /> Link Bank Account</Button>
                     </Link>
                 )}
                 {!user.withdrawalPin && (
                    <Link href="/set-pin" passHref>
                        <Button className="w-full" variant="accent"><KeyRound className="mr-2" /> Set Withdrawal PIN</Button>
                    </Link>
                 )}
            </CardContent>
             <CardFooter>
                 <Button className="w-full" onClick={() => history.back()}><ArrowLeft className="mr-2" /> Go Back</Button>
             </CardFooter>
        </Card>
    </div>
);


export default function WithdrawPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails | null>(null);
  const { user, addTransaction, reloadUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const playSuccessSound = useSound('https://files.catbox.moe/6fv876.wav');

  const form = useForm<z.infer<typeof formSchema,>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: '',
      amount: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !user.linkedBankAccount || !user.withdrawalPin) return;
    
    if (values.pin !== user.withdrawalPin) {
      form.setError('pin', { type: 'manual', message: 'Incorrect PIN.' });
      return;
    }

    if (values.amount > user.balance) {
      form.setError('amount', { type: 'manual', message: 'Insufficient balance.' });
      return;
    }
    
    setIsLoading(true);
    
    await addTransaction({
      type: 'withdrawal',
      amount: values.amount,
      status: 'pending',
      description: 'Withdrawal request'
    });

    setWithdrawalDetails({
        amount: values.amount,
        name: user.linkedBankAccount.name,
        upiId: user.linkedBankAccount.upiId,
        date: new Date(),
    });
    
    setIsLoading(false);
    setIsSuccess(true);
    playSuccessSound();
    toast({
      title: "Request Sent",
      description: "Your withdrawal request has been sent for approval."
    });
    reloadUser();
  };

  if (user && (!user.linkedBankAccount || !user.withdrawalPin)) {
    return (
        <ClientOnly>
            <PreWithdrawalCheck user={user} />
        </ClientOnly>
    );
  }

  if (isSuccess && withdrawalDetails) {
    return (
       <ClientOnly>
         <div className="container mx-auto max-w-md p-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-6rem)]">
            <Card className="w-full animate-fade-in-up">
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
                    <CardTitle className="text-2xl">Request Submitted!</CardTitle>
                    <CardDescription className="text-base px-4">
                        Your request will be processed after manual verification.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <ReceiptRow label="Amount" value={formatCurrency(withdrawalDetails.amount)} />
                        <Separator />
                        <ReceiptRow label="Recipient Name" value={withdrawalDetails.name} />
                        <ReceiptRow label="UPI ID" value={withdrawalDetails.upiId} />
                         <Separator />
                        <ReceiptRow label="Date &amp; Time" value={format(withdrawalDetails.date, 'dd MMM yyyy, hh:mm a')} />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button size="lg" className="w-full h-12 text-lg" onClick={() => router.push('/wallet')}>
                        <ArrowLeft className="mr-2" /> Back to Wallet
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={() => router.push('/history')}>
                        <Receipt className="mr-2" /> View History
                    </Button>
                </CardFooter>
            </Card>
        </div>
       </ClientOnly>
    )
  }

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-md p-4 space-y-6">
        
        {user && (
            <Card className="text-center bg-muted/30 mt-6">
                <CardHeader>
                    <CardDescription className="flex items-center justify-center gap-2"><Wallet className="h-4 w-4" /> Available Balance</CardDescription>
                    <CardTitle className="text-4xl font-bold text-primary">{formatCurrency(user.balance)}</CardTitle>
                </CardHeader>
            </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><BadgeCheck className="text-blue-500"/> Verified Account</CardTitle>
            <CardDescription>Withdrawals will be sent to this account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{user?.linkedBankAccount?.name}</p>
            </div>
             <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">Bank Name</p>
                <p className="font-medium">{user?.linkedBankAccount?.bankName}</p>
            </div>
             <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">UPI ID</p>
                <p className="font-medium">{user?.linkedBankAccount?.upiId}</p>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={`Minimum ${MIN_WITHDRAWAL}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4-Digit Withdrawal PIN</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="accent" size="lg" className="w-full h-12 text-lg" disabled={isLoading}>
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
