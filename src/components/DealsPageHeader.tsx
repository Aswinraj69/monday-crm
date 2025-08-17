import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Settings,
  Download,
  User,
  Plus,
  Group,
  Bell,
  Grid3X3,
  HelpCircle,
  Zap,
  RotateCcw,
  Import,
  Link
} from 'lucide-react';
import { DealStatus, GroupByField } from '@/types/deals';

interface DealsPageHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (filters: any) => void;
  groupByField?: GroupByField | null;
  onGroupByChange?: (field: GroupByField | null) => void;
}

export function DealsPageHeader({ 
  activeTab, 
  onTabChange, 
  onSearchChange, 
  onFilterChange,
  groupByField,
  onGroupByChange
}: DealsPageHeaderProps) {
  const [searchValue, setSearchValue] = useState('');

  const tabs = [
    { id: 'main-table', label: 'Main table', count: 0 },
    { id: 'sales-report', label: 'Sales report', count: 0 },
    { id: 'pipeline', label: 'Pipeline', count: 0 },
  ];

  return (
    <div className="bg-background border-b">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                className={`text-sm font-medium pb-2 border-b-2 ${
                  activeTab === tab.id 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid view
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              List view
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Customize view
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between px-6 py-3 bg-muted/30">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-2 bg-[#007f9b] text-white">
  <Plus className="h-4 w-4" />
  New deal
  <ChevronDown className="h-4 w-4" />
</Button>

            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Add new deal</DropdownMenuItem>
              <DropdownMenuItem>Import deals</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search" 
              className="pl-9 w-64" 
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                onSearchChange?.(e.target.value);
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Person
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All people</DropdownMenuItem>
              <DropdownMenuItem>Team members</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onFilterChange?.({ status: ['new', 'qualified', 'proposal'] })}>
                Active deals only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange?.({ status: ['won'] })}>
                Closed won only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange?.({ status: [] })}>
                Clear filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Group className="h-4 w-4" />
                Group by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onGroupByChange?.(null)}>
                No grouping
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onGroupByChange?.('status')}>
                Group by status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupByChange?.('owner')}>
                Group by owner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupByChange?.('company')}>
                Group by company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupByChange?.('source')}>
                Group by source
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}