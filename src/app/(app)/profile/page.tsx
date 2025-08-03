'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateTimeLeft, openTelegramLink } from '@/lib/helpers';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, LogOut, Gift, Share2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { APP_LINK, REFERRAL_BONUS } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const promoCodeSchema = z.object({
  code: z.string().min(4, "Code must be 4 characters.").max(4, "Code must be 4 characters."),
});

export default function ProfilePage() {
  const { user, loading, applyPromoCode, reloadUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { code: "" },
  });

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };
  
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to Clipboard', description: `${type} has been copied.` });
  };

  const onPromoSubmit = (values: z.infer<typeof promoCodeSchema>) => {
    const result = applyPromoCode(values.code);
    switch (result) {
      case 'success':
        toast({ title: 'Success!', description: 'Promo code applied successfully.' });
        reloadUser();
        break;
      case 'used_today':
        toast({ variant: 'destructive', title: 'Error', description: 'You have already used this promo code today.' });
        break;
      case 'used_before':
         toast({ variant: 'destructive', title: 'Error', description: 'You have already used this promo code.' });
        break;
      case 'invalid':
        toast({ variant: 'destructive', title: 'Error', description: 'Invalid promo code. Please ask your agent for a valid one.' });
        break;
    }
    form.reset();
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>Your personal dashboard</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(user.balance)}</p>
            </div>
             <div>
              <p className="text-sm text-muted-foreground">Referral Code</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg">{user.referralCode}</p>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(user.referralCode, 'Referral Code')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Refer & Earn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Refer your friends and earn a <span className="font-bold text-primary">{formatCurrency(REFERRAL_BONUS)}</span> bonus for each successful referral!</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Share Your Link</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share and Earn!</DialogTitle>
                  <DialogDescription>Share this link with your friends. When they sign up, contact your agent to claim your bonus.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <Input id="link" defaultValue={APP_LINK} readOnly />
                    <Button type="submit" size="sm" className="px-3" onClick={() => handleCopy(APP_LINK, "App Link")}>
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5"/> Apply Promo Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPromoSubmit)} className="flex items-start gap-2">
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl><Input className="font-code text-center tracking-widest" placeholder="CODE" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit">Apply</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>My Investments</CardTitle></CardHeader>
          <CardContent>
            {user.investments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">You have no active investments.</p>
            ) : (
              <div className="space-y-4">
                {user.investments.map(inv => {
                  const { progress, timeLeftString } = calculateTimeLeft(inv);
                  return (
                    <div key={inv.id} className="p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">{inv.planName}</p>
                        <p className="font-bold text-primary">{formatCurrency(inv.expectedReturn)}</p>
                      </div>
                      <Progress value={progress} className="mb-2 h-2" />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Invested: {formatCurrency(inv.amount)}</span>
                        <span>{timeLeftString} left</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
