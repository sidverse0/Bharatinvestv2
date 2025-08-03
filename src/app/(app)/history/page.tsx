'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/helpers';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Receipt, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction, TransactionType } from '@/types';

const TransactionIcon = ({ type }: { type: TransactionType }) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
    case 'withdrawal':
      return <ArrowUpRight className="h-5 w-5 text-red-600" />;
    case 'investment':
      return <PiggyBank className="h-5 w-5 text-blue-600" />;
    case 'bonus':
      return <Gift className="h-5 w-5 text-yellow-500" />;
    case 'promo':
      return <Receipt className="h-5 w-5 text-purple-600" />;
    default:
      return null;
  }
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

export default function HistoryPage() {
  const { user, loading } = useUser();

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

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter">Transaction History</h1>
          <p className="text-muted-foreground">A record of all your activities.</p>
        </header>

        {loading ? (
          renderSkeleton()
        ) : !user || user.transactions.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Transactions Yet</CardTitle>
              <CardDescription>Your transaction history will appear here once you start.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {user.transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx) => (
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
