
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, openTelegramLink } from "@/lib/helpers";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, TrendingUp, Wallet, Zap, Flame, Star, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestmentCardProps {
  plan: InvestmentPlan;
  animationDelay?: number;
}

const PlanBadge = ({ badge }: { badge?: string }) => {
  if (!badge) return null;
  
  const badgeContent = {
    'Popular': { icon: <Star className="h-3 w-3" />, color: 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50' },
    'Best Value': { icon: <Zap className="h-3 w-3" />, color: 'bg-accent/80 text-accent-foreground border-accent/50' },
    'Hot': { icon: <Flame className="h-3 w-3" />, color: 'bg-red-500/80 text-white border-red-600/50' },
  }[badge];

  if (!badgeContent) return null;

  return (
    <Badge className={cn("absolute top-4 right-4 z-10 flex items-center gap-1 border shadow-lg", badgeContent.color)}>
        {badgeContent.icon}
        <span>{badge}</span>
    </Badge>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-semibold text-foreground">{value}</span>
    </div>
);


export default function InvestmentCard({ plan, animationDelay = 0 }: InvestmentCardProps) {
  const { user, addInvestment } = useUser();
  const { toast } = useToast();

  const handleInvest = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please log in to invest.' });
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
      startDate: new Date().toISOString(),
      duration: plan.duration,
    });
    
    const message = `NEW INVESTMENT\n\nUser: ${user.name}\nPlan: ${plan.title} (${formatCurrency(plan.amount)} -> ${formatCurrency(plan.returns)})\nDuration: ${plan.duration} days`;
    openTelegramLink(message);

    toast({
      title: 'Investment Successful!',
      description: `You have invested ${formatCurrency(plan.amount)} in ${plan.title}.`,
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
      <PlanBadge badge={plan.badge} />
      
      <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-primary">{plan.title}</CardTitle>
          <p className="text-sm text-muted-foreground h-10">{plan.description}</p>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-3 pt-0">
        <InfoRow icon={<Wallet className="h-4 w-4" />} label="Invest Amount" value={formatCurrency(plan.amount)} />
        <InfoRow icon={<TrendingUp className="h-4 w-4" />} label="Total Return" value={formatCurrency(plan.returns)} />
        <InfoRow icon={<Percent className="h-4 w-4" />} label="Daily Return" value={formatCurrency(dailyReturn)} />
        <InfoRow icon={<Calendar className="h-4 w-4" />} label="Duration" value={`${plan.duration} days`} />
      </CardContent>

      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full font-bold h-11">
                Invest Now <ArrowRight className="ml-2 h-4 w-4" />
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
