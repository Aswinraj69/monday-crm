import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Deal } from '@/types/deals';

interface TableTooltipProps {
  deal: Deal;
  field: keyof Deal;
  children: React.ReactNode;
}

export function TableTooltip({ deal, field, children }: TableTooltipProps) {
  const getTooltipContent = () => {
    switch (field) {
      case 'dealName':
        return (
          <div className="space-y-1">
            <p className="font-semibold">{deal.dealName}</p>
            <p className="text-xs text-muted-foreground">Company: {deal.company}</p>
            {deal.notes && <p className="text-xs">{deal.notes}</p>}
          </div>
        );
      case 'status':
        return (
          <div className="space-y-1">
            <p className="font-semibold">Status: {deal.status}</p>
            <p className="text-xs">Probability: {deal.probability}%</p>
            <p className="text-xs">Expected Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
          </div>
        );
      case 'value':
        return (
          <div className="space-y-1">
            <p className="font-semibold">Deal Value: ${deal.value.toLocaleString()}</p>
            <p className="text-xs">Probability: {deal.probability}%</p>
            <p className="text-xs">Expected Value: ${Math.round(deal.value * deal.probability / 100).toLocaleString()}</p>
          </div>
        );
      case 'owner':
        return (
          <div className="space-y-1">
            <p className="font-semibold">{deal.owner}</p>
            <p className="text-xs">Last Activity: {new Date(deal.lastActivity).toLocaleDateString()}</p>
            <p className="text-xs">Source: {deal.source}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const content = getTooltipContent();
  if (!content) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}