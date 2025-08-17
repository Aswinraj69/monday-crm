import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/types/deals';

interface ActivityTimelineProps {
  activities?: Activity[];
  maxItems?: number;
}

export function ActivityTimeline({ activities = [], maxItems = 3 }: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems);
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-500';
      case 'email':
        return 'bg-green-500';
      case 'meeting':
        return 'bg-purple-500';
      case 'note':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '✉️';
      case 'meeting':
        return '🤝';
      case 'note':
        return '📝';
      default:
        return '•';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-2 h-6 bg-gray-200 rounded-sm"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {displayActivities.map((activity, index) => (
        <TooltipProvider key={activity.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`w-2 h-6 rounded-sm  transition-opacity hover:opacity-80 ${getActivityColor(activity.type)}`}
                tabIndex={0}
              />
            </TooltipTrigger>
            <TooltipContent 
              className="bg-background border shadow-lg z-50 max-w-64"
              side="top"
            >
              <div className="space-y-2 p-1">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span>{getActivityIcon(activity.type)}</span>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.description}
                </div>
                <div className="text-xs">
                  <div><span className="font-medium">Date:</span> {new Date(activity.date).toLocaleDateString()}</div>
                  <div><span className="font-medium">By:</span> {activity.user}</div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      {activities.length > maxItems && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="text-xs h-6 px-1 "
                tabIndex={0}
              >
                +{activities.length - maxItems}
              </Badge>
            </TooltipTrigger>
            <TooltipContent 
              className="bg-background border shadow-lg z-50"
              side="top"
            >
              <div className="text-xs">
                {activities.length - maxItems} more activities
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}