import React from 'react';
import { Check, Copy, Trash2, Archive, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

export function BulkActionsToolbar({ selectedCount, onClearSelection, onBulkAction }: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg mx-4 mb-2 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {selectedCount} selected
        </Badge>
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction('duplicate')}
            className="text-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction('archive')}
            className="text-sm"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Contact Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onBulkAction('send-email')}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('schedule-call')}>
                <Phone className="h-4 w-4 mr-2" />
                Schedule Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('schedule-meeting')}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm">
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onBulkAction('export')}>
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('assign-owner')}>
                Assign Owner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('update-status')}>
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onBulkAction('delete')}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-muted-foreground hover:text-foreground"
      >
        <Check className="h-4 w-4 mr-2" />
        Clear Selection
      </Button>
    </div>
  );
}