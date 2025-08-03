
'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateTimeLeft } from '@/lib/helpers';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, LogOut, Gift, Share2, Wallet, BarChart, User as UserIcon, Medal, Award, TrendingUp, AlertTriangle, Briefcase, PlusCircle, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { APP_LINK, REFERRAL_BONUS } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const promoCodeSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters.").max(10, "Code must be at most 10 characters."),
});

interface BadgeProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  achieved: boolean;
}

const AchievementBadge = ({ icon, label, description, achieved }: BadgeProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all",
          achieved ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted text-muted-foreground opacity-60"
        )}>
          <div className={cn("rounded-full p-2", achieved ? "bg-primary/20" : "bg-muted-foreground/20")}>
            {icon}
          </div>
          <p className="text-xs font-semibold">{label}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);


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
        toast({ title: 'Success!', description: 'Promo code applied successfully.', className: 'bg-green-500 text-white' });
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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  
  const achievementBadges: BadgeProps[] = [
    {
      icon: <Medal className="h-6 w-6" />,
      label: "First Investment",
      description: "Awarded for making your first investment.",
      achieved: user.firstInvestmentMade,
    },
    {
      icon: <Award className="h-6 w-6" />,
      label: "₹1000 Deposited",
      description: "Awarded for depositing a total of ₹1000 or more.",
      achieved: user.totalDeposits >= 1000,
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: "7-Day Streak",
      description: `Awarded for logging in 7 days in a row. Current streak: ${user.loginStreak} day(s).`,
      achieved: user.loginStreak >= 7,
    },
  ];

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://files.catbox.moe/5uph06.png" alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
          </CardHeader>
        </Card>

        <Link href="/my-investments" passHref>
          <Card className="shadow-sm hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>My Investments</CardTitle>
                    <CardDescription>View your active and past investments</CardDescription>
                  </div>
                </div>
                <Rocket className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
          </Card>
        </Link>
        

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🎉 Achievements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {achievementBadges.map(badge => (
              <AchievementBadge key={badge.label} {...badge} />
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Refer & Earn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Refer friends and earn a <span className="font-bold text-primary">{formatCurrency(REFERRAL_BONUS)}</span> bonus for each referral!</p>
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

          <Card className="shadow-sm">
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
        </div>
      </div>
    </ClientOnly>
  );
}
