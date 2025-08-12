
'use client';

import { InvestmentPlan } from "@/types";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatCurrency, calculateTimeLeft } from "@/lib/helpers";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, TrendingUp, Wallet, Zap, Flame, Star, Percent, PackageX, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Progress } from "./ui/progress";
import { useEffect, useState } from "react";

interface InvestmentCardProps {
  plan: InvestmentPlan;
  animationDelay?: number;
}

const PlanBadge = ({ badge, timeLeft }: { badge?: string, timeLeft?: string }) => {
  if (!badge) return null;
  
  const badgeContent: {[key: string]: {icon: React.ReactNode, color: string}} = {
    'Popular': { icon: <Star className="h-3 w-3" />, color: 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50' },
    'Best Value': { icon: <Zap className="h-3 w-3" />, color: 'bg-accent/80 text-accent-foreground border-accent/50' },
    'Hot': { icon: <Flame className="h-3 w-3" />, color: 'bg-red-500/80 text-white border-red-600/50' },
    'Limited Offer': { icon: <Hourglass className="h-3 w-3" />, color: 'bg-blue-500/80 text-white border-blue-600/50' },
    'Expired': { icon: <PackageX className="h-3 w-3" />, color: 'bg-muted text-muted-foreground border-muted-foreground/50' },
  };

  const currentBadge = badgeContent[badge];
  if (!currentBadge) return null;

  return (
    <Badge className={cn("absolute top-4 right-4 z-10 flex items-center gap-1.5 border shadow-lg", currentBadge.color)}>
        {currentBadge.icon}
        <span>{badge}</span>
        {badge === 'Limited Offer' && timeLeft && <span className="font-mono text-xs">({timeLeft})</span>}
    </Badge>
  );
};

const InfoRow = ({ icon, value }: { icon: React.ReactNode, value: string }) => (
    <div className="flex items-center justify-between text-sm py-1">
        <div className={cn("flex items-center gap-2 text-muted-foreground")}>
            {icon}
            <span className="font-semibold text-foreground text-base">{value}</span>
        </div>
    </div>
);


export default function InvestmentCard({ plan, animationDelay = 0 }: InvestmentCardProps) {
  const { user, addInvestment } = useUser();
  const { toast } = useToast();
  const [stockProgress, setStockProgress] = useState(0);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (plan.badge === 'Expired') {
        setIsOutOfStock(true);
        setStockProgress(100);
        return;
    }

    const isLimited = plan.badge === 'Limited Offer';
    
    // Limited Offer: 24 hours available, 4 hours renewing
    const LIMITED_AVAILABILITY = 24 * 60 * 60 * 1000;
    const LIMITED_RENEWAL = 4 * 60 * 60 * 1000;
    const LIMITED_CYCLE = LIMITED_AVAILABILITY + LIMITED_RENEWAL;

    // Regular Offer: 48 hours available, 4 hours renewing
    const REGULAR_AVAILABILITY = 48 * 60 * 60 * 1000;
    const REGULAR_RENEWAL = 4 * 60 * 60 * 1000;
    const REGULAR_CYCLE = REGULAR_AVAILABILITY + REGULAR_RENEWAL;

    const CYCLE_DURATION = isLimited ? LIMITED_AVAILABILITY : REGULAR_AVAILABILITY;
    const TOTAL_CYCLE = isLimited ? LIMITED_CYCLE : REGULAR_CYCLE;
    
    const cycleStartTime = Math.floor(Date.now() / TOTAL_CYCLE) * TOTAL_CYCLE - (plan.id * (CYCLE_DURATION / 10));

    const updateProgress = () => {
      const now = Date.now();
      const timeIntoCycle = (now - cycleStartTime) % TOTAL_CYCLE;

      if (timeIntoCycle < CYCLE_DURATION) {
        const progress = (timeIntoCycle / CYCLE_DURATION) * 100;
        setStockProgress(progress);
        setIsOutOfStock(false);
        
        if(isLimited) {
            const msLeft = CYCLE_DURATION - timeIntoCycle;
            const hours = Math.floor(msLeft / (1000 * 60 * 60));
            const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((msLeft % (1000 * 60)) / 1000);
            setTimeLeft(`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2, '0')}`);
        }

      } else {
        setStockProgress(100);
        setIsOutOfStock(true);
        if(isLimited) setTimeLeft("00:00:00");
      }
    };
    
    updateProgress();
    const interval = setInterval(updateProgress, 1000); // Update every second

    return () => clearInterval(interval);

  }, [plan.id, plan.badge]);

  const handleInvest = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please log in to invest.' });
      return;
    }
    
    const isAlreadyInvested = user.investments.some(inv => {
      const { isComplete } = calculateTimeLeft(inv);
      return inv.planId === plan.id && !isComplete;
    });

    if (isAlreadyInvested) {
      toast({ variant: 'destructive', title: 'Already Active', description: 'You already have an active investment in this plan.' });
      return;
    }

    if (user.balance < plan.amount) {
      toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'Please deposit funds to invest.' });
      return;
    }

    addInvestment({
      planId: plan.id,
      planName: plan.title,
      amount: plan.amount,
      expectedReturn: plan.returns,
      duration: plan.duration,
      image: plan.image,
    });
  };
  
  const dailyReturn = (plan.returns - plan.amount) / plan.duration;

  return (
    <Card 
        className={cn(
            "relative flex flex-col bg-card/70 hover:bg-card transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg overflow-hidden border-2 border-transparent hover:border-primary/20",
            "animate-fade-in-up"
        )}
        style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
    >
      <PlanBadge badge={plan.badge} timeLeft={timeLeft} />
      
      <CardHeader className="p-0">
          <Image src={plan.image} alt={plan.title} width={400} height={200} className="w-full h-32 object-cover" data-ai-hint="investment growth" />
      </CardHeader>
      
      <CardContent className="flex-grow p-4 space-y-2">
        <h3 className="text-lg font-bold text-primary">{plan.title}</h3>
        <p className="text-xs text-muted-foreground h-9">{plan.description}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2">
            <InfoRow icon={<Wallet className="h-5 w-5 text-blue-500" />} value={formatCurrency(plan.amount)} />
            <InfoRow icon={<TrendingUp className="h-5 w-5 text-green-500" />} value={formatCurrency(plan.returns)} />
            <InfoRow icon={<Percent className="h-5 w-5 text-purple-500" />} value={`${formatCurrency(dailyReturn)}/day`} />
            <InfoRow icon={<Calendar className="h-5 w-5 text-red-500" />} value={`${plan.duration} days`} />
        </div>
      </CardContent>

       <div className="px-4 pb-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
                {isOutOfStock && plan.badge !== 'Expired' ? (
                    <span className="font-semibold text-destructive flex items-center gap-1"><Hourglass className="h-3 w-3 animate-spin" /> Renewing...</span>
                ) : (
                    <span className="font-medium text-muted-foreground">Availability</span>
                )}
                <span className="font-semibold text-primary">{isOutOfStock ? '0' : (100 - stockProgress).toFixed(0)}% left</span>
            </div>
            <Progress value={isOutOfStock ? 100 : stockProgress} className={cn("h-2", isOutOfStock && "[&>div]:bg-destructive")} />
        </div>

      <CardFooter className="p-4 pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="accent" className="w-full font-bold h-11" disabled={isOutOfStock}>
                {isOutOfStock && plan.badge === 'Expired' ? <><PackageX className="mr-2 h-4 w-4" /> Expired</> : 
                 isOutOfStock ? <><PackageX className="mr-2 h-4 w-4" /> Out of Stock</> :
                 <>Invest Now <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Investment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to invest <span className="font-bold">{formatCurrency(plan.amount)}</span> in the <span className="font-bold">{plan.title}</span> plan? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleInvest}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
