
'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { ClientOnly } from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Loader2, Gift, Box } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
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
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useSound } from '@/hooks/use-sound';

const OPEN_COST = 10;

const TreasureBox = ({ onOpen, isOpening, boxId }: { onOpen: (boxId: number) => void; isOpening: boolean; boxId: number }) => {
    return (
        <button 
            onClick={() => onOpen(boxId)} 
            disabled={isOpening}
            className="relative aspect-square group focus:outline-none"
        >
            <Image 
                src="https://files.catbox.moe/0re852.png" 
                alt="Treasure Box" 
                layout="fill" 
                className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center h-10 w-10 bg-black/50 text-white rounded-full font-bold text-sm border-2 border-yellow-400 group-hover:bg-primary/80 transition-colors">
                  ₹{OPEN_COST}
                </div>
            </div>
            {isOpening && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            )}
        </button>
    )
}


export default function TreasurePage() {
    const { user, openTreasureBox, loading } = useUser();
    const { toast } = useToast();
    const [openingBox, setOpeningBox] = useState<number | null>(null);
    const [wonAmount, setWonAmount] = useState(0);
    const [showWinDialog, setShowWinDialog] = useState(false);
    const playOpenSound = useSound('https://files.catbox.moe/hy5w0l.mp3');
    const playWinSound = useSound('https://files.catbox.moe/6fv876.wav');

    const handleOpenBox = async (boxId: number) => {
        if (openingBox !== null || !user) return;
        
        if (user.balance < OPEN_COST) {
            toast({ variant: 'destructive', title: 'Cannot Open', description: `You need at least ${formatCurrency(OPEN_COST)} to open a box.` });
            return;
        }

        setOpeningBox(boxId);
        playOpenSound();

        const result = await openTreasureBox();
        
        if(result.success && result.amount) {
            setTimeout(() => {
                setWonAmount(result.amount);
                setShowWinDialog(true);
                playWinSound();
            }, 500); 
        } else {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not open the box. Please try again later.' });
             setOpeningBox(null);
        }
    }

    const handleCloseDialog = () => {
        setShowWinDialog(false);
        setOpeningBox(null);
    }
    
    if (loading || !user) {
        return <ClientOnly />;
    }

    return (
        <ClientOnly>
             <AlertDialog open={showWinDialog} onOpenChange={handleCloseDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                        <div className="p-4 rounded-full bg-yellow-400/20 text-yellow-500 mb-4">
                            <Gift className="h-12 w-12" />
                        </div>
                         <AlertDialogTitle className="text-2xl">You Won!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Congratulations! You won <span className="font-bold text-primary">{formatCurrency(wonAmount)}</span>!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full" onClick={handleCloseDialog}>Awesome!</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>

            <div className="container mx-auto max-w-2xl p-4 flex flex-col items-center justify-center space-y-6 min-h-[calc(100vh-8rem)]">
                 <header className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-2"><Box className="h-10 w-10"/>Treasure Hunt</h1>
                    <p className="text-muted-foreground mt-2">Open a box and win exciting rewards!</p>
                </header>
                
                 <Card className="w-full max-w-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className='flex items-center gap-2'>
                            <Wallet className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold">Your Balance:</span>
                        </div>
                        <span className="text-lg font-bold">{formatCurrency(user.balance)}</span>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    {[...Array(12)].map((_, i) => (
                        <TreasureBox 
                            key={i} 
                            boxId={i}
                            onOpen={handleOpenBox} 
                            isOpening={openingBox === i}
                        />
                    ))}
                </div>
            </div>
        </ClientOnly>
    );
}
