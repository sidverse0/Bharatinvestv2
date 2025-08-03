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
import { ArrowRight, Clock, TrendingUp, Zap, Star, BarChartBig } from "lucide-react";

interface InvestmentCardProps {
  plan: InvestmentPlan;
}

const planIcons: { [key: number]: React.ReactNode } = {
  1: <TrendingUp className="h-8 w-8 text-primary" />,
  2: <Zap className="h-8 w-8 text-primary" />,
  3: <Star className="h-8 w-8 text-primary" />,
  4: <BarChartBig className="h-8 w-8 text-primary" />,
  5: <TrendingUp className="h-8 w-8 text-primary" />,
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

  return (
    <Card className="flex flex-col bg-card/70 hover:bg-card transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg">
      {plan.badge && (
        <Badge className="absolute -top-3 -right-3 bg-accent text-accent-foreground shadow-lg">{plan.badge}</Badge>
      )}
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardDescription>Invest {formatCurrency(plan.amount)}</CardDescription>
          <CardTitle className="text-3xl font-bold text-primary">Get {formatCurrency(plan.returns)}</CardTitle>
        </div>
        <div className="p-2 bg-primary/10 rounded-full">
           {planIcons[plan.id] || <TrendingUp className="h-8 w-8 text-primary" />}
        </div>
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
