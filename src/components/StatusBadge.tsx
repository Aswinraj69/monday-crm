import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DealStatus } from '@/types/deals';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: DealStatus;
  interactive?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function StatusBadge({ 
  status, 
  interactive = false, 
  showTooltip = true,
  className 
}: StatusBadgeProps) {
  const statusConfigs = {
    new: { 
      label: 'Discovery', 
      className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
      description: 'Initial contact and discovery phase',
      probability: '10-25%'
    },
    qualified: { 
      label: 'Qualified', 
      className: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
      description: 'Lead has been qualified and shows strong interest',
      probability: '25-50%'
    },
    proposal: { 
      label: 'Proposal', 
      className: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200',
      description: 'Proposal has been sent and is under review',
      probability: '50-75%'
    },
    won: { 
      label: 'Won', 
      className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
      description: 'Deal successfully closed and won',
      probability: '100%'
    },
    lost: { 
      label: 'Lost', 
      className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
      description: 'Deal was lost or cancelled',
      probability: '0%'
    }
  };
  
  const config = statusConfigs[status] || statusConfigs.new;
  
  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium transition-colors ",
        interactive && "",
        config.className,
        className
      )}
      tabIndex={0}
    >
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent 
          className="bg-background border shadow-lg z-50 max-w-64"
          side="top"
        >
          <div className="space-y-2 p-1">
            <div className="font-semibold text-sm">{config.label} Stage</div>
            <div className="text-xs text-muted-foreground">
              {config.description}
            </div>
            <div className="text-xs">
              <span className="font-medium">Typical probability:</span> {config.probability}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}