'use client';
import { ActivityNotificationsOutput, generateActivityNotifications } from '@/ai/flows/generate-activity-notifications';
import { formatCurrency } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, ArrowDownToLine, ArrowUpFromLine, User } from 'lucide-react';

const ActionIcon = ({ action, icon }: { action: string; icon: string; }) => {
    switch (action) {
        case 'invested': return <User className="h-5 w-5 text-blue-500" />;
        case 'deposited': return <ArrowDownToLine className="h-5 w-5 text-green-500" />;
        case 'withdrew': return <ArrowUpFromLine className="h-5 w-5 text-red-500" />;
        default: return <span>{icon}</span>;
    }
}


export default function ActivityNotification() {
  const [notification, setNotification] = useState<ActivityNotificationsOutput | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const data = await generateActivityNotifications();
        setNotification(data);
        setIsVisible(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 3500); // Animation is 0.5s, so visible for 3s
      } catch (error) {
        // Silently fail if AI call fails
        console.error("Failed to generate notification:", error);
      }
    };
    
    // Initial notification after a delay
    const initialTimeout = setTimeout(fetchNotification, 8000);

    const intervalId = setInterval(fetchNotification, 10000); // every 10 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-card/80 backdrop-blur-sm border p-2 pl-3 pr-4 shadow-lg transition-transform duration-500 ease-out",
        isVisible ? 'translate-y-0' : '-translate-y-[150%]'
      )}
    >
        {notification && (
            <>
                <div className="p-1.5 bg-background rounded-full">
                    <ActionIcon action={notification.action} icon={notification.actionIcon} />
                </div>
                <p className="text-sm font-medium text-foreground">
                    <span className="font-bold">{notification.name}</span>
                    <span className="text-muted-foreground"> {notification.action} </span>
                    <span className="font-bold text-green-600">{formatCurrency(notification.amount)}</span>
                </p>
            </>
        )}
    </div>
  );
}
