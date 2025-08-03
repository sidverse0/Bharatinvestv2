
'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateTimeLeft } from '@/lib/helpers';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, PlusCircle, Calendar, TrendingUp, CheckCircle, BarChart, Rocket } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const StatCard = ({ icon, title, value, isLoading, className }: { icon: React.ReactNode, title: string, value: string, isLoading: boolean, className?: string }) => (
    <div className={`bg-muted/40 p-3 rounded-xl flex items-center gap-3 ${className}`}>
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : <p className="text-lg font-bold">{value}</p>}
      </div>
    </div>
  );


export default function MyInvestmentsPage() {
    const { user, loading } = useUser();

    if (loading || !user) {
        return (
            <div className="container mx-auto max-w-2xl p-4 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }
    
    const activePlansCount = user.investments.filter(inv => !calculateTimeLeft(inv).isComplete).length;
    const totalReturns = user.transactions
        .filter(tx => tx.type === 'return')
        .reduce((acc, tx) => acc + tx.amount, 0);

    return (
        <ClientOnly>
            <div className="container mx-auto max-w-2xl p-4 space-y-6">
                <header className="mb-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Rocket className="h-8 w-8 text-primary"/> My Investments</h1>
                    <p className="text-muted-foreground">An overview of your investment portfolio.</p>
                </header>

                <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                        icon={<Briefcase className="h-5 w-5" />} 
                        title="Active Plans" 
                        value={activePlansCount.toString()} 
                        isLoading={loading}
                    />
                     <StatCard 
                        icon={<PlusCircle className="h-5 w-5" />} 
                        title="Total Returns" 
                        value={formatCurrency(totalReturns)} 
                        isLoading={loading}
                    />
                </div>
                
                <section>
                    {user.investments.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardHeader>
                                <CardTitle>No Investments Yet</CardTitle>
                                <CardDescription>Your investments will appear here once you start.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {user.investments.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(inv => {
                                const { progress, timeLeftString, isComplete } = calculateTimeLeft(inv);
                                return (
                                    <Card key={inv.id} className="overflow-hidden shadow-sm">
                                        <div className="flex">
                                            <Image src={inv.image || 'https://placehold.co/400x200.png'} alt={inv.planName} width={120} height={120} className="object-cover w-28 h-auto" data-ai-hint="investment growth" />
                                            <div className="p-4 flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-lg">{inv.planName}</p>
                                                        <p className="text-xs text-muted-foreground">Invested: {formatCurrency(inv.amount)}</p>
                                                    </div>
                                                     <Badge variant={isComplete ? "default" : "secondary"} className={cn(isComplete && "bg-green-600")}>
                                                        {isComplete ? <CheckCircle className="h-3 w-3 mr-1" /> : <BarChart className="h-3 w-3 mr-1" />}
                                                        {isComplete ? 'Completed' : 'Active'}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="mt-3">
                                                    <div className="flex justify-between items-center mb-1 text-xs">
                                                        <span className="font-medium text-muted-foreground">Progress</span>
                                                        <span className="font-semibold text-primary">{timeLeftString}</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2" />
                                                    <div className="flex justify-between items-center text-xs mt-1">
                                                        <span className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3 w-3 text-green-500" /> Return: <span className="font-semibold text-foreground">{formatCurrency(inv.expectedReturn)}</span></span>
                                                        <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3 text-red-500" />{inv.duration} days</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </ClientOnly>
    );
}

