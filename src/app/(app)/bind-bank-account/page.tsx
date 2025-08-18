
'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Landmark, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ClientOnly';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(3, 'Please enter your full name.'),
  bankName: z.string().min(3, 'Please enter a valid bank name.'),
  upiId: z.string().min(5, 'Please enter a valid UPI ID.').regex(/@/, 'Please enter a valid UPI ID.'),
});


export default function BindBankAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, bindBankAccount } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.linkedBankAccount?.name || '',
      bankName: user?.linkedBankAccount?.bankName || '',
      upiId: user?.linkedBankAccount?.upiId || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const success = await bindBankAccount(values);
    setIsLoading(false);

    if (success) {
      toast({
        title: 'Account Linked!',
        description: 'Your bank account has been successfully linked and verified.',
      });
      router.push('/profile');
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not link your account. Please try again.',
        });
    }
  };
  
  if (user && user.linkedBankAccount) {
    return (
      <ClientOnly>
        <div className="container mx-auto max-w-md p-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <Card className="w-full text-center">
             <CardHeader>
                 <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-2">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                 </div>
                <CardTitle className="text-2xl">Account Already Linked</CardTitle>
                <CardDescription>
                    Your account is securely linked. For security reasons, it cannot be changed or removed.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0 text-left bg-muted/50 rounded-lg mx-4">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Name</span>
                 <span className="font-medium">{user.linkedBankAccount.name}</span>
               </div>
                <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Bank Name</span>
                 <span className="font-medium">{user.linkedBankAccount.bankName}</span>
               </div>
                <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">UPI ID</span>
                 <span className="font-medium">{user.linkedBankAccount.upiId}</span>
               </div>
            </CardContent>
            <CardFooter className="p-4">
                 <Link href="/profile" passHref className="w-full">
                    <Button className="w-full"><ArrowLeft className="mr-2" /> Back to Profile</Button>
                 </Link>
             </CardFooter>
          </Card>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-md p-4 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2"><Landmark className="h-8 w-8 text-primary"/> Link Bank Account</h1>
          <p className="text-muted-foreground mt-1">Securely link your account for withdrawals.</p>
        </header>

        <Image src="https://files.catbox.moe/3gwusu.png" alt="Payment Partners" width={400} height={100} className="w-full h-auto object-contain" data-ai-hint="payment logos" />
        
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
                <Button type="submit" variant="accent" size="lg" className="w-full h-12 text-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Link Account"}
                </Button>
              </form>
            </Form>
             <Alert variant="destructive" className="mt-6">
              <AlertDescription>
                Please double-check your details before submitting. For security, you will not be able to edit this information later.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
