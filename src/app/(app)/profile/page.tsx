
'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/helpers';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, LogOut, Gift, Share2, Wallet, User as UserIcon, Medal, Award, TrendingUp, Rocket, ChevronRight, BadgeCheck, Crown, CalendarCheck, Moon, Sun, Star, ShieldCheck, Lock, CheckCircle, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { APP_LINK, REFERRAL_BONUS } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';
import Image from 'next/image';

const promoCodeSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters.").max(10, "Code must be at most 10 characters."),
});

interface BadgeProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  achieved: boolean;
  isClaimed: boolean;
  onClaim: (label: string) => void;
}

const AchievementBadge = ({ icon, label, description, achieved, isClaimed, onClaim }: BadgeProps) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!achieved || isClaimed || claiming) return;
    setClaiming(true);
    await onClaim(label);
    // No need to set claiming to false, as the component will re-render with isClaimed=true
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex flex-col items-center justify-between gap-2 p-3 rounded-lg border text-center transition-all aspect-square",
            achieved ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted text-muted-foreground opacity-60"
          )}>
            <div className={cn("rounded-full p-3", achieved ? "bg-primary/20" : "bg-muted-foreground/20")}>
              {icon}
            </div>
            <p className="text-sm font-semibold leading-tight">{label}</p>
            <div className="h-9 mt-1">
              {achieved && !isClaimed && (
                 <Button size="sm" variant="accent" className="h-7 text-xs px-2" onClick={handleClaim} disabled={claiming}>
                    <Gift className="mr-1 h-3 w-3" />
                    {claiming ? 'Claiming...' : 'Claim'}
                  </Button>
              )}
               {achieved && isClaimed && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Claimed</span>
                  </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function ProfilePage() {
  const { user, loading, applyPromoCode, reloadUser, claimAchievementReward } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPromoSuccessDialog, setShowPromoSuccessDialog] = useState(false);
  const [promoAmount, setPromoAmount] = useState(0);

   useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  };

  const form = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { code: "" },
  });

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };
  
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to Clipboard', description: `${type} has been copied.` });
  };

  const onPromoSubmit = async (values: z.infer<typeof promoCodeSchema>) => {
    const result = await applyPromoCode(values.code);
    
    if (result.status === 'success') {
        setPromoAmount(result.amount);
        setShowPromoSuccessDialog(true);
    } else {
        let description = 'Invalid promo code. Please ask your agent for a valid one.';
        if (result.status === 'used_today') {
            description = 'You have already used a promo code today.';
        } else if (result.status === 'used_before') {
            description = 'You have already used this promo code before.';
        }
        toast({ variant: 'destructive', title: 'Error', description });
    }
    form.reset();
  };

  const handleClaimAchievement = async (label: string) => {
    const result = await claimAchievementReward(label);
    if (result.success && result.amount) {
      toast({
        title: 'Reward Claimed!',
        description: `You have received a bonus of ${formatCurrency(result.amount)}!`,
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }
  
  const achievementBadges: Omit<BadgeProps, 'isClaimed' | 'onClaim'>[] = [
    {
      icon: <Medal className="h-7 w-7" />,
      label: "First Investment",
      description: "Awarded for making your first investment.",
      achieved: user.firstInvestmentMade,
    },
    {
      icon: <Award className="h-7 w-7" />,
      label: "₹1000 Deposited",
      description: "Awarded for depositing a total of ₹1000 or more.",
      achieved: user.totalDeposits >= 1000,
    },
    {
      icon: <TrendingUp className="h-7 w-7" />,
      label: "7-Day Streak",
      description: `Awarded for logging in 7 days in a row. Current streak: ${user.loginStreak} day(s).`,
      achieved: user.loginStreak >= 7,
    },
  ];
  
  const MenuLinkCard = ({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) => (
     <Link href={href} passHref>
        <Card className="shadow-sm hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {icon}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
        </Card>
      </Link>
  );

  return (
    <ClientOnly>
       <AlertDialog open={showPromoSuccessDialog} onOpenChange={setShowPromoSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader className="items-center">
              <div className="p-4 rounded-full bg-yellow-400/20 text-yellow-500 mb-4">
                  <Star className="h-12 w-12" />
              </div>
              <AlertDialogTitle className="text-2xl">Success!</AlertDialogTitle>
              <AlertDialogDescription>
                You have received a bonus of <span className="font-bold text-primary">{formatCurrency(promoAmount)}</span>!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="w-full">Awesome!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
       </AlertDialog>

      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-primary/50">
                    <AvatarImage src="https://files.catbox.moe/5uph06.png" alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 transform -rotate-12" />
                </div>
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {user.name}
                    <BadgeCheck className="h-6 w-6 text-blue-500" />
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Log out">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be returned to the login screen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <MenuLinkCard 
                href="/my-investments"
                icon={<Rocket className="h-6 w-6" />}
                title="My Investments"
                description="View your active and past investments"
            />
             <MenuLinkCard 
                href="/daily-checkin"
                icon={<CalendarCheck className="h-6 w-6" />}
                title="Daily Check-in"
                description="Claim your daily rewards"
            />
        </div>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2 text-base">
                {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="p-0 relative h-24 flex items-center justify-center text-center">
             <Image src="https://files.catbox.moe/claqn3.jpg" alt="Achievements Banner" layout="fill" objectFit="cover" className="z-0" data-ai-hint="achievement banner abstract" />
             <div className="absolute inset-0 bg-black/50 z-10"></div>
             <CardTitle className="text-3xl font-bold text-white z-20 flex items-center gap-2"><Trophy className="h-8 w-8" /> Achievements</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-card grid grid-cols-3 gap-4">
            {achievementBadges.map(badge => (
              <AchievementBadge 
                key={badge.label} 
                {...badge}
                isClaimed={user.claimedAchievements.includes(badge.label)}
                onClaim={handleClaimAchievement}
              />
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
              <a href={`${APP_LINK}?ref=${user.referralCode}`} target="_blank" rel="noopener noreferrer">
                <Button className="w-full">Share Your Link</Button>
              </a>
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
                  <Button type="submit" variant="accent">Apply</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm text-center">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <BharatInvestLogo className="h-16 w-16" />
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-primary">Bharat</h2>
              <h2 className="text-3xl font-bold text-yellow-500">Invest</h2>
            </div>
            <p className="text-lg font-semibold text-muted-foreground">Roz Kamao, Safe Bachaao!</p>
            <p className="text-sm font-medium text-foreground">BHARATINV PVT. LTD</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardContent className="p-3">
                <div className="flex items-center justify-around text-green-600 font-semibold text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        <span>100% secure</span>
                    </div>
                     <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5" />
                        <span>100% Safe</span>
                    </div>
                     <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        <span>100% Protected</span>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
    </ClientOnly>
  );
}
