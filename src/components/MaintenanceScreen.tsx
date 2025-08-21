
'use client';

import { Ban } from 'lucide-react';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';

interface MaintenanceConfig {
  title: string;
  message: string;
}

export default function MaintenanceScreen({ config }: { config: MaintenanceConfig }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-6">
      <div className="max-w-md w-full flex flex-col items-center">
        
        <div className="relative flex h-28 w-28 items-center justify-center mb-6">
            <BharatInvestLogo className="h-28 w-28 opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Ban className="h-24 w-24 text-destructive animate-pulse" />
            </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-destructive">{config.title}</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground">{config.message}</p>
        
         <div className="mt-12 flex flex-col items-center gap-2">
            <BharatInvestLogo className="h-12 w-12" />
            <p className="text-sm font-medium text-foreground">BHARATINV PVT. LTD</p>
        </div>
      </div>
    </div>
  );
}
