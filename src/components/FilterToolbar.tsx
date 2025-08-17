import React, { useState } from 'react';
import { Filter, X, Search, Calendar, DollarSign, User, MoreHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DealStatus } from '@/types/deals';

interface FilterToolbarProps {
  onFiltersChange: (filters: {
    status?: DealStatus;
    owner?: string;
    minValue?: number;
    maxValue?: number;
    search?: string;
  }) => void;
  availableStatuses: DealStatus[];
  availableOwners: string[];
}

export function FilterToolbar({ onFiltersChange, availableStatuses, availableOwners }: FilterToolbarProps) {
  const [status, setStatus] = useState<string>('all');
  const [owner, setOwner] = useState<string>('all');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const applyFilters = () => {
    const filters: any = {};
    if (status !== 'all') filters.status = status as DealStatus;
    if (owner !== 'all') filters.owner = owner;
    if (minValue) filters.minValue = parseFloat(minValue);
    if (maxValue) filters.maxValue = parseFloat(maxValue);
    if (searchTerm) filters.search = searchTerm;
    
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setStatus('all');
    setOwner('all');
    setMinValue('');
    setMaxValue('');
    setSearchTerm('');
    onFiltersChange({});
  };

  const hasFilters = status !== 'all' || owner !== 'all' || minValue || maxValue || searchTerm;
  const filterCount = [
    status !== 'all' ? status : null, 
    owner !== 'all' ? owner : null, 
    minValue, 
    maxValue,
    searchTerm
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/20 border-b">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search deals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-48 bg-background"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-36 bg-background border shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <SelectValue placeholder="Stage" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          <SelectItem value="all">All Stages</SelectItem>
          <SelectItem value="new">Discovery</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="proposal">Proposal</SelectItem>
          <SelectItem value="won">Won</SelectItem>
          <SelectItem value="lost">Lost</SelectItem>
        </SelectContent>
      </Select>

      {/* Owner Filter */}
      <Select value={owner} onValueChange={setOwner}>
        <SelectTrigger className="w-40 bg-background border shadow-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Owner" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          <SelectItem value="all">All Owners</SelectItem>
          {availableOwners.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Amount Range */}
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <Input
          type="number"
          placeholder="Min"
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          className="w-20 text-sm bg-background"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="Max"
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          className="w-20 text-sm bg-background"
        />
      </div>

      {/* Apply/Clear Buttons */}
      <Button onClick={applyFilters} size="sm" variant="default" className="bg-primary">
        Apply Filters
      </Button>

      {hasFilters && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-background">
            {filterCount} active
          </Badge>
          <Button onClick={clearFilters} size="sm" variant="ghost">
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
      )}

      <div className="ml-auto">
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}