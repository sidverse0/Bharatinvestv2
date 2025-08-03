
'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { ClientOnly } from '@/components/ClientOnly';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle, Gift, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isToday, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/helpers';
import Confetti from 'react-confetti';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const CheckInDay = ({ day, isClaimed, isToday, isFuture }: { day: number, isClaimed: boolean, isToday: boolean, isFuture: boolean }) => {
    return (
        <div className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
            isClaimed && "border-green-500 bg-green-500/10 text-green-600",
            isToday && !isClaimed && "border-primary bg-primary/10 animate-pulse",
            isFuture && "border-dashed bg-muted/50 text-muted-foreground opacity-70",
            !isFuture && !isClaimed && !isToday && "border-red-500 bg-red-500/10 text-red-600"
        )}>
            {isClaimed && <CheckCircle className="absolute -top-2 -right-2 h-6 w-6 bg-background text-green-500 rounded-full" />}
            
            <p className="font-bold text-lg">Day {day}</p>
            <Gift className="h-8 w-8" />

            <div className="text-xs font-semibold">
                {isClaimed ? "Claimed" : isToday ? "Claim Now" : isFuture ? "Locked" : "Missed"}
            </div>
        </div>
    )
}

export default function DailyCheckinPage() {
    const { user, claimDailyCheckIn, loading } = useUser();
    const [showConfetti, setShowConfetti] = useState(false);
    const [claimedAmount, setClaimedAmount] = useState(0);
    const [showClaimDialog, setShowClaimDialog] = useState(false);
    const { toast } = useToast();

    if (loading || !user) {
        return <ClientOnly />;
    }
    
    const canClaimToday = user.lastCheckInDate ? !isToday(parseISO(user.lastCheckInDate)) : true;
    const currentDay = (user.checkInStreak % 7) + 1;

    const handleClaim = () => {
        if (!canClaimToday) {
             toast({ variant: 'destructive', title: 'Already Claimed', description: 'You have already claimed your reward for today.' });
            return;
        }

        const result = claimDailyCheckIn();
        if(result.success && result.amount) {
            setClaimedAmount(result.amount);
            setShowConfetti(true);
            setShowClaimDialog(true);
            setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
        } else {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not claim reward. Please try again later.' });
        }
    }


    return (
        <ClientOnly>
             {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
             <AlertDialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                        <div className="p-4 rounded-full bg-yellow-400/20 text-yellow-500 mb-4">
                            <Star className="h-12 w-12" />
                        </div>
                        <AlertDialogTitle className="text-2xl">Reward Claimed!</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have successfully claimed your reward of <span className="font-bold text-primary">{formatCurrency(claimedAmount)}</span>!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full">Awesome!</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
            <div className="container mx-auto max-w-2xl p-4 space-y-6">
                 <header className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Daily Check-in</h1>
                    <p className="text-muted-foreground">Claim a reward every day you check in!</p>
                </header>

                <Card>
                    <CardContent className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {[...Array(7)].map((_, i) => {
                            const day = i + 1;
                            const isClaimed = day <= user.checkInStreak;
                            const isTodayDay = day === user.checkInStreak + 1;
                            const isFuture = day > user.checkInStreak + 1;
                            
                            return <CheckInDay key={day} day={day} isClaimed={isClaimed} isToday={isTodayDay && canClaimToday} isFuture={isFuture} />
                        })}
                    </CardContent>
                </Card>
                
                <Button 
                    size="lg" 
                    className="w-full h-14 text-xl" 
                    onClick={handleClaim}
                    disabled={!canClaimToday || loading}
                >
                    {canClaimToday ? 'Claim Today\'s Reward' : 'Claimed for Today'}
                </Button>
            </div>
        </ClientOnly>
    );
}
