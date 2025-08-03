
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
import Image from "next/image";

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

const InfoRow = ({ icon, value, iconClassName }: { icon: React.ReactNode, value: string, iconClassName?: string }) => (
    <div className="flex items-center justify-between text-sm py-1">
        <div className={cn("flex items-center gap-2 text-muted-foreground", iconClassName)}>
            {icon}
            <span className="font-semibold text-foreground text-base">{value}</span>
        </div>
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
      image: plan.image,
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
      
      <CardHeader className="p-0">
          <Image src={plan.image} alt={plan.title} width={400} height={200} className="w-full h-32 object-cover" data-ai-hint="investment growth" />
      </CardHeader>
      
      <CardContent className="flex-grow p-4 space-y-2">
        <h3 className="text-lg font-bold text-primary">{plan.title}</h3>
        <p className="text-xs text-muted-foreground h-9">{plan.description}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2">
            <InfoRow icon={<Wallet className="h-5 w-5 text-blue-500" />} value={formatCurrency(plan.amount)} />
            <InfoRow icon={<TrendingUp className="h-5 w-5 text-green-500" />} value={formatCurrency(plan.returns)} />
            <InfoRow icon={<Percent className="h-5 w-5 text-purple-500" />} value={formatCurrency(dailyReturn)} />
            <InfoRow icon={<Calendar className="h-5 w-5 text-red-500" />} value={`${plan.duration} days`} />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
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
