
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, openTelegramLink } from "@/lib/helpers";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Clock, Flame, Star } from "lucide-react";
import Image from "next/image";

interface InvestmentCardProps {
  plan: InvestmentPlan;
}

const PlanBadge = ({ badge }: { badge: string }) => {
  const badgeContent = {
    'Popular': { icon: <Star className="h-3 w-3" />, color: 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50' },
    'Best Value': { icon: <Star className="h-3 w-3" />, color: 'bg-accent/80 text-accent-foreground border-accent/50' },
    'Hot': { icon: <Flame className="h-3 w-3" />, color: 'bg-red-500/80 text-white border-red-600/50' },
  }[badge];

  if (!badgeContent) return null;

  return (
    <Badge className={`absolute top-3 right-3 z-10 flex items-center gap-1 border shadow-lg ${badgeContent.color}`}>
        {badgeContent.icon}
        <span>{badge}</span>
    </Badge>
  );
};


export default function InvestmentCard({ plan }: InvestmentCardProps) {
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
      planName: `Plan ${formatCurrency(plan.amount)}`,
      amount: plan.amount,
      expectedReturn: plan.returns,
      startDate: new Date().toISOString(),
      duration: plan.duration,
    });
    
    const message = `NEW INVESTMENT\n\nUser: ${user.name}\nPlan: ${formatCurrency(plan.amount)} -> ${formatCurrency(plan.returns)}\nDuration: ${plan.duration} days`;
    openTelegramLink(message);

    toast({
      title: 'Investment Successful!',
      description: `You have invested ${formatCurrency(plan.amount)}.`,
    });
  };
  
  const planImages: { [key: number]: {src: string, hint: string} } = {
    1: { src: 'https://placehold.co/400x200.png', hint: 'investment growth' },
    2: { src: 'https://placehold.co/400x200.png', hint: 'financial security' },
    3: { src: 'https://placehold.co/400x200.png', hint: 'savings success' },
    4: { src: 'https://placehold.co/400x200.png', hint: 'money tree' },
    5: { src: 'https://placehold.co/400x200.png', hint: 'market chart' },
  };
  
  const image = planImages[plan.id] || { src: 'https://placehold.co/400x200.png', hint: 'finance' };


  return (
    <Card className="flex flex-col bg-card/70 hover:bg-card transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg overflow-hidden">
      {plan.badge && <PlanBadge badge={plan.badge} />}
      
      <div className="relative h-32 w-full">
         <Image src={image.src} alt={`Investment plan ${plan.id}`} layout="fill" objectFit="cover" data-ai-hint={image.hint} />
      </div>

      <CardHeader>
          <CardDescription>Invest {formatCurrency(plan.amount)}</CardDescription>
          <CardTitle className="text-3xl font-bold text-primary">Get {formatCurrency(plan.returns)}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{plan.duration} days duration</span>
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full font-bold">Invest Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Investment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to invest <span className="font-bold">{formatCurrency(plan.amount)}</span> in this plan? This action cannot be undone.
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
