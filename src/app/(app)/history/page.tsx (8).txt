
'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/helpers';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Receipt, Gift, TrendingUp, CalendarCheck, List, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { format } from 'date-fns';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction, TransactionType } from '@/types';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const TransactionIcon = ({ type }: { type: TransactionType }) => {
  const iconMap: Record<TransactionType, React.ReactNode> = {
    'deposit': <ArrowDownToLine className="h-5 w-5 text-green-600" />,
    'withdrawal': <ArrowUpRight className="h-5 w-5 text-red-600" />,
    'investment': <PiggyBank className="h-5 w-5 text-blue-600" />,
    'bonus': <Gift className="h-5 w-5 text-yellow-500" />,
    'promo': <Receipt className="h-5 w-5 text-purple-600" />,
    'return': <TrendingUp className="h-5 w-5 text-indigo-500" />,
    'check-in': <CalendarCheck className="h-5 w-5 text-cyan-500" />,
  }
  return iconMap[type] || null;
};

const StatusBadge = ({ status }: { status: Transaction['status'] }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-300">Pending</Badge>;
    case 'success':
      return <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-300">Success</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

type FilterType = 'all' | 'deposit' | 'withdrawal' | 'investment' | 'return';

const FilterButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
    <Button variant={isActive ? 'accent' : 'outline'} className="flex-1 flex flex-col h-auto py-2 px-1 gap-1 items-center" onClick={onClick}>
        <div className={cn("p-2 rounded-full", isActive ? "bg-white/20" : "bg-muted")}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold">{label}</span>
    </Button>
);


export default function HistoryPage() {
  const { user, loading } = useUser();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredAndSortedTransactions = useMemo(() => {
    if (!user) return [];
    
    const sorted = [...user.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filter === 'all') {
      return sorted;
    }
    return sorted.filter(tx => tx.type === filter);

  }, [user, filter]);

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  const filterOptions: {id: FilterType; label: string; icon: React.ReactNode}[] = [
      { id: 'all', label: 'All', icon: <List className="h-4 w-4" /> },
      { id: 'deposit', label: 'Deposit', icon: <ArrowDownToLine className="h-4 w-4" /> },
      { id: 'withdrawal', label: 'Withdraw', icon: <ArrowUpFromLine className="h-4 w-4" /> },
      { id: 'investment', label: 'Invest', icon: <PiggyBank className="h-4 w-4" /> },
      { id: 'return', label: 'Return', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Transaction History</h1>
          <p className="text-muted-foreground">A record of all your activities.</p>
        </header>
        
        <Card className="mb-6 p-2 bg-muted/50">
          <div className="flex justify-around items-center gap-1">
            {filterOptions.map(opt => (
              <FilterButton
                key={opt.id}
                label={opt.label}
                icon={opt.icon}
                isActive={filter === opt.id}
                onClick={() => setFilter(opt.id)}
              />
            ))}
          </div>
        </Card>

        {loading ? (
          renderSkeleton()
        ) : !user || filteredAndSortedTransactions.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Transactions Yet</CardTitle>
              <CardDescription>
                {filter === 'all'
                  ? 'Your transaction history will appear here once you start.'
                  : `You have no ${filter} transactions yet.`}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTransactions.map((tx) => (
              <Card key={tx.id} className="bg-card/50">
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <TransactionIcon type={tx.type} />
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'withdrawal' || tx.type === 'investment' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'withdrawal' || tx.type === 'investment' ? '-' : '+'} {formatCurrency(tx.amount)}
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
