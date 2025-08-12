
'use client';

import { Award, Flame, Gem, Shield, Star } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/helpers";

const DepositAmountButton = ({ amount, onSelect }: { amount: number, onSelect: (amount: number) => void}) => {
    const tags: {[key: number]: {label: string, bonus: string, icon: React.ReactNode, color: string }} = {
      100: { label: 'Popular', bonus: '+₹10 Bonus', icon: <Star className="h-3 w-3" />, color: 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50' },
      200: { label: 'Recommended', bonus: '+₹20 Bonus', icon: <Award className="h-3 w-3" />, color: 'bg-blue-400/80 text-blue-900 border-blue-500/50' },
      400: { label: 'Hot', bonus: '+₹30 Bonus', icon: <Flame className="h-3 w-3" />, color: 'bg-red-500/80 text-white border-red-600/50' },
      600: { label: 'Best Value', bonus: '+₹40 Bonus', icon: <Shield className="h-3 w-3" />, color: 'bg-green-500/80 text-white border-green-600/50' },
      1000: { label: 'Pro', bonus: '+₹50 Bonus', icon: <Gem className="h-3 w-3" />, color: 'bg-purple-500/80 text-white border-purple-600/50' },
    }
    const tag = tags[amount];
  
    return (
      <Button 
        variant="outline" 
        size="lg" 
        className="h-24 text-lg relative flex flex-col items-center justify-center transition-all hover:scale-105 hover:bg-primary/10 hover:border-primary/50" 
        onClick={() => onSelect(amount)}
      >
        {tag && (
          <Badge className={cn("absolute -top-2 -right-2 z-10 flex items-center gap-1 border shadow-lg", tag.color)}>
            {tag.icon} {tag.label}
          </Badge>
        )}
        <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
        {tag && <span className="text-sm font-semibold text-primary">{tag.bonus}</span>}
      </Button>
    );
};

export default DepositAmountButton;
