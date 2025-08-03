
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { formatCurrency } from '@/lib/helpers';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletPage() {
  const { user, loading } = useUser();

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter">My Wallet</h1>
          <p className="text-muted-foreground">Manage your funds with ease.</p>
        </header>

        <Card className="mb-8 text-center bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
          <CardHeader>
            <CardDescription className="text-primary-foreground/80">Current Balance</CardDescription>
             {loading || !user ? (
                <Skeleton className="h-12 w-56 mx-auto rounded-md bg-white/20" />
              ) : (
                <CardTitle className="text-5xl font-extrabold tracking-tighter">
                  {formatCurrency(user.balance)}
                </CardTitle>
              )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/deposit" passHref>
            <Button variant="default" size="lg" className="h-28 w-full text-xl flex-col gap-2 shadow-lg hover:scale-105 transition-transform group">
              <ArrowDownLeft className="h-8 w-8 group-hover:animate-bounce" />
              Deposit
            </Button>
          </Link>
          <Link href="/withdraw" passHref>
            <Button variant="secondary" size="lg" className="h-28 w-full text-xl flex-col gap-2 shadow-lg hover:scale-105 transition-transform group">
              <ArrowUpRight className="h-8 w-8 group-hover:animate-ping" />
              Withdraw
            </Button>
          </Link>
        </div>
      </div>
    </ClientOnly>
  );
}

