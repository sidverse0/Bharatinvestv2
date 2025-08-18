
'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ClientOnly';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  pin: z.string().length(4, 'PIN must be 4 digits.').regex(/^\d+$/, 'PIN must be numeric.'),
  confirmPin: z.string().length(4, 'PIN must be 4 digits.'),
}).refine((data) => data.pin === data.confirmPin, {
    message: "PINs don't match",
    path: ["confirmPin"],
});

export default function SetPinPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setWithdrawalPin } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: '',
      confirmPin: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const success = await setWithdrawalPin(values.pin);
    setIsLoading(false);

    if (success) {
      toast({
        title: 'PIN Set Successfully!',
        description: 'Your withdrawal PIN has been updated.',
      });
      router.push('/profile');
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not set your PIN. Please try again.',
        });
    }
  };
  
  if (user && user.withdrawalPin) {
    return (
      <ClientOnly>
        <div className="container mx-auto max-w-md p-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <Card className="w-full text-center">
             <CardHeader>
                 <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-2">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                 </div>
                <CardTitle className="text-2xl">Withdrawal PIN is Set</CardTitle>
                <CardDescription>
                    Your PIN is already set. For security, you can only set it once. Contact support if you need to reset it.
                </CardDescription>
            </CardHeader>
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <KeyRound className="h-8 w-8 text-primary"/> Set Withdrawal PIN
          </h1>
          <p className="text-muted-foreground mt-1">Create a 4-digit PIN for secure withdrawals.</p>
        </header>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New 4-Digit PIN</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm PIN</FormLabel>
                      <FormControl>
                         <Input type="password" placeholder="••••" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="accent" size="lg" className="w-full h-12 text-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Set PIN"}
                </Button>
              </form>
            </Form>
             <Alert variant="destructive" className="mt-6">
              <AlertDescription>
                Keep your PIN secret and do not share it with anyone. You can only set it once.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
