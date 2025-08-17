import React from 'react';
import { Deal } from '@/types/deals';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';

interface TotalsBarProps {
  deals: Deal[];
  visibleColumns: Array<{ key: keyof Deal; title: string }>;
}

export function TotalsBar({ deals, visibleColumns }: TotalsBarProps) {
  const calculateStats = (values: number[]) => {
    if (values.length === 0) return { sum: 0, avg: 0, count: 0, min: 0, max: 0 };
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const count = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { sum, avg, count, min, max };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1
    }).format(num);
  };

  const getColumnStats = (columnKey: keyof Deal) => {
    const values = deals
      .map(deal => deal[columnKey])
      .filter((val): val is number => typeof val === 'number');
    
    return calculateStats(values);
  };

  const getDealStatusStats = () => {
    const statusCounts = deals.reduce((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return statusCounts;
  };

  const getOwnerStats = () => {
    const ownerCounts = deals.reduce((acc, deal) => {
      acc[deal.owner] = (acc[deal.owner] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(ownerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getExpectedValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  };

  const getDaysToClose = () => {
    const today = new Date();
    const closeDates = deals
      .map(deal => new Date(deal.expectedCloseDate))
      .filter(date => date > today);
    
    if (closeDates.length === 0) return 0;
    
    const avgDays = closeDates.reduce((sum, date) => {
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0) / closeDates.length;
    
    return Math.round(avgDays);
  };

  const renderTotalCell = (columnKey: keyof Deal) => {
    const numericColumns = ['value', 'probability'];
    
    if (!numericColumns.includes(columnKey as string)) {
      return <span className="text-muted-foreground">-</span>;
    }

    const stats = getColumnStats(columnKey);
    
    if (stats.count === 0) {
      return <span className="text-muted-foreground">-</span>;
    }

    const isCurrency = columnKey === 'value';
    const isPercentage = columnKey === 'probability';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className=" text-sm font-semibold flex items-center gap-1" tabIndex={0}>
              {isCurrency ? (
                <>
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(stats.sum)}
                </>
              ) : (
                <>
                  <Target className="h-3 w-3" />
                  {formatNumber(stats.avg)}%
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-background border shadow-lg z-50 p-3"
            side="top"
          >
            <div className="space-y-2 text-xs min-w-48">
              <div className="font-medium text-sm border-b pb-2">
                {columnKey === 'value' ? 'Deal Value Statistics' : 'Probability Statistics'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium">Sum:</span> {isCurrency ? formatCurrency(stats.sum) : `${formatNumber(stats.sum)}%`}</div>
                <div><span className="font-medium">Average:</span> {isCurrency ? formatCurrency(stats.avg) : `${formatNumber(stats.avg)}%`}</div>
                <div><span className="font-medium">Count:</span> {stats.count} items</div>
                <div><span className="font-medium">Min:</span> {isCurrency ? formatCurrency(stats.min) : `${formatNumber(stats.min)}%`}</div>
                <div><span className="font-medium">Max:</span> {isCurrency ? formatCurrency(stats.max) : `${formatNumber(stats.max)}%`}</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const statusStats = getDealStatusStats();
  const ownerStats = getOwnerStats();
  const expectedValue = getExpectedValue();
  const avgDaysToClose = getDaysToClose();

  return (
    <div className="bg-background border-t border-border p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Basic stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{deals.length} deals</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Expected: {formatCurrency(expectedValue)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Avg {avgDaysToClose} days to close
            </span>
          </div>
        </div>

        {/* Right side - Status breakdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
            {Object.entries(statusStats).map(([status, count]) => (
              <Badge key={status} variant="outline" className="text-xs">
                {status}: {count}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Top owners:</span>
            {ownerStats.map(([owner, count]) => (
              <Badge key={owner} variant="secondary" className="text-xs">
                {owner}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Column totals row */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground">Column Totals:</span>
          {visibleColumns.map((column) => (
            <div key={column.key} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{column.title}:</span>
              {renderTotalCell(column.key)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}