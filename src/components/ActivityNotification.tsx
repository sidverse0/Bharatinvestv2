'use client';
import { generateActivityNotifications } from '@/ai/flows/generate-activity-notifications';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActivityNotification() {
  const [notification, setNotification] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const { message } = await generateActivityNotifications();
        setNotification(message);
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

    const intervalId = setInterval(fetchNotification, 60000); // every 1 minute

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm border p-2 px-4 shadow-lg transition-transform duration-500 ease-out",
        isVisible ? 'translate-y-0' : '-translate-y-[150%]'
      )}
    >
      <Zap className="h-4 w-4 text-accent" />
      <p className="text-sm font-medium">{notification}</p>
    </div>
  );
}
