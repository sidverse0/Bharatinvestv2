
'use client';

import { useState, useEffect } from 'react';
import { BharatInvestLogo } from '@/components/icons/BharatInvestLogo';

interface MaintenanceConfig {
  countdownEndTime: string;
  title: string;
  message: string;
}

const CountdownUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="text-4xl sm:text-6xl font-bold text-primary tracking-tighter tabular-nums">{value}</div>
    <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-widest">{label}</div>
  </div>
);

const MaintenanceGraphic = () => (
    <div className="relative w-64 h-48">
        <style jsx>{`
            .swing-plug {
                animation: swing 3s ease-in-out infinite;
                transform-origin: top center;
            }
            @keyframes swing {
                0%, 100% { transform: rotate(5deg); }
                50% { transform: rotate(-5deg); }
            }
            .float-server {
                animation: float 4s ease-in-out infinite;
            }
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            .server-1 { animation-delay: 0s; }
            .server-2 { animation-delay: 0.5s; }
            .server-3 { animation-delay: 1s; }
        `}</style>
         {/* Servers */}
        <div className="absolute bottom-5 left-0 w-24">
            <div className="float-server server-1">
                <svg viewBox="0 0 80 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="78" height="20" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <circle cx="68" cy="11" r="2" fill="hsl(var(--primary))"/>
                    <path d="M12 11H52" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                </svg>
            </div>
             <div className="float-server server-2" style={{marginTop: '-4px'}}>
                <svg viewBox="0 0 80 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="78" height="20" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <circle cx="68" cy="11" r="2" fill="hsl(var(--primary))"/>
                    <path d="M12 11H52" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                </svg>
            </div>
             <div className="float-server server-3" style={{marginTop: '-4px'}}>
                <svg viewBox="0 0 80 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="78" height="20" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <circle cx="68" cy="11" r="2" fill="hsl(var(--primary))"/>
                     <path d="M12 11H52" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                </svg>
            </div>
        </div>

        {/* Monitor */}
        <div className="absolute bottom-0 right-0 w-40">
            <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stand */}
                <path d="M70 118H90" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
                <path d="M80 100V118" stroke="hsl(var(--foreground))" strokeWidth="2" />
                <rect x="50" y="100" width="60" height="5" rx="2.5" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                {/* Screen */}
                <rect x="1" y="1" width="148" height="100" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                <path d="M149 13C149 6.37258 143.627 1 137 1H1V100H137C143.627 100 149 94.6274 149 88V13Z" fill="hsl(var(--primary))" fillOpacity="0.8" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                 {/* Face */}
                <path d="M50 50L65 60M65 50L50 60" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"/>
                <path d="M95 50L110 60M110 50L95 60" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"/>
                <path d="M70 75Q82.5 70 95 75" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
        </div>

         {/* Plug */}
        <div className="swing-plug absolute top-0 right-14 w-12">
            <svg viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 0V20" stroke="hsl(var(--foreground))" strokeWidth="3"/>
                <path d="M12 30H36" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"/>
                <path d="M12 40H36" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"/>
                <rect x="1.5" y="18.5" width="45" height="30" rx="8" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="3"/>
            </svg>
        </div>
    </div>
);


export default function MaintenanceScreen({ config }: { config: MaintenanceConfig }) {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    if (!config.countdownEndTime) return;
    
    const endTime = new Date(config.countdownEndTime).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }
      
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [config.countdownEndTime]);


  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-6">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
            <BharatInvestLogo className="h-20 w-20" />
        </div>
        
        <div className="relative flex justify-center mb-6">
            <MaintenanceGraphic />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{config.title}</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground">{config.message}</p>
        
        <div className="mt-10 flex justify-center items-center gap-4 sm:gap-8">
            <CountdownUnit value={timeLeft.hours} label="Hours" />
             <div className="text-4xl sm:text-6xl font-bold text-muted-foreground -mt-5">:</div>
            <CountdownUnit value={timeLeft.minutes} label="Minutes" />
             <div className="text-4xl sm:text-6xl font-bold text-muted-foreground -mt-5">:</div>
            <CountdownUnit value={timeLeft.seconds} label="Seconds" />
        </div>

      </div>
    </div>
  );
}
