import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, Plus, Trash2, Edit, ArrowUpDown, Calendar, Group } from 'lucide-react';
import { Deal, SortConfig, ColumnConfig, DealStatus, GroupByField, DealGroup } from '@/types/deals';
import { StatusBadge } from './StatusBadge';
import { FilterToolbar } from './FilterToolbar';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { ColumnControls } from './ColumnControls';

import { TableTooltip } from './TableTooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
} from '@/components/ui/context-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DealsTableProps {
  deals: Deal[];
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export function DealsTable({ deals, columns, onColumnsChange }: DealsTableProps) {
  const [sorts, setSorts] = useState<SortConfig[]>([]);
  
  const [activeFilters, setActiveFilters] = useState<{
    status?: DealStatus;
    owner?: string;
    minValue?: number;
    maxValue?: number;
  }>({});
  
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState<{ dealId: string; isOpen: boolean }>({ dealId: '', isOpen: false });
  const [groupByField, setGroupByField] = useState<GroupByField | null>(null);

  const processedDeals = useMemo(() => {
    let result = [...deals];
    
    if (activeFilters.status) {
      result = result.filter(deal => deal.status === activeFilters.status);
    }
    if (activeFilters.owner) {
      result = result.filter(deal => deal.owner === activeFilters.owner);
    }
    if (activeFilters.minValue !== undefined) {
      result = result.filter(deal => deal.value >= activeFilters.minValue!);
    }
    if (activeFilters.maxValue !== undefined) {
      result = result.filter(deal => deal.value <= activeFilters.maxValue!);
    }
    
    if (sorts.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorts) {
          const aVal = a[sort.key];
          const bVal = b[sort.key];
          
          let comparison = 0;
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
          } else {
            comparison = String(aVal).localeCompare(String(bVal));
          }
          
          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }
    
    return result;
  }, [deals, activeFilters, sorts]);

  const groupedDeals = useMemo(() => {
    if (!groupByField) {
      return [{ name: 'All Deals', key: 'all', deals: processedDeals, total: processedDeals.length, totalValue: processedDeals.reduce((sum, deal) => sum + deal.value, 0), color: 'text-gray-600', bgColor: 'bg-gray-50', expanded: true }];
    }

    const groups: DealGroup[] = [];
    const uniqueValues = [...new Set(processedDeals.map(deal => deal[groupByField]))];

    uniqueValues.forEach(value => {
      const groupDeals = processedDeals.filter(deal => deal[groupByField] === value);
      groups.push({
        name: String(value),
        key: String(value),
        deals: groupDeals,
        total: groupDeals.length,
        totalValue: groupDeals.reduce((sum, deal) => sum + deal.value, 0),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        expanded: true
      });
    });

    return groups;
  }, [processedDeals, groupByField]);

  const handleSort = useCallback((columnKey: keyof Deal, isShiftClick: boolean) => {
    setSorts(currentSorts => {
      const existingIndex = currentSorts.findIndex(s => s.key === columnKey);
      
      if (isShiftClick) {
        if (existingIndex >= 0) {
          const newSorts = [...currentSorts];
          const current = newSorts[existingIndex];
          if (current.direction === 'asc') {
            newSorts[existingIndex] = { ...current, direction: 'desc' };
          } else {
            newSorts.splice(existingIndex, 1);
          }
          return newSorts;
        } else {
          return [...currentSorts, { key: columnKey, direction: 'asc' }];
        }
      } else {
        if (existingIndex >= 0) {
          const current = currentSorts[existingIndex];
          if (current.direction === 'asc') {
            return [{ key: columnKey, direction: 'desc' }];
          } else {
            return [];
          }
        } else {
          return [{ key: columnKey, direction: 'asc' }];
        }
      }
    });
  }, []);

  const getSortIndicator = useCallback((columnKey: keyof Deal) => {
    const sortIndex = sorts.findIndex(s => s.key === columnKey);
    if (sortIndex === -1) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/30" />;
    }
    
    const sort = sorts[sortIndex];
    const Icon = sort.direction === 'asc' ? ChevronUp : ChevronDown;
    
    return (
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-primary" />
        {sorts.length > 1 && (
          <span className="text-xs bg-primary text-primary-foreground rounded px-1 min-w-[16px] h-4 flex items-center justify-center">
            {sortIndex + 1}
          </span>
        )}
      </div>
    );
  }, [sorts]);

  const handleRowClick = useCallback((dealId: string, index: number, event: React.MouseEvent) => {
    const isCtrlCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    if (isShift && lastSelectedIndex >= 0) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = processedDeals.slice(start, end + 1).map(deal => deal.id);
      
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        rangeIds.forEach(id => newSet.add(id));
        return newSet;
      });
    } else if (isCtrlCmd) {
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dealId)) {
          newSet.delete(dealId);
        } else {
          newSet.add(dealId);
        }
        return newSet;
      });
      setLastSelectedIndex(index);
    } else {
      setSelectedRows(new Set([dealId]));
      setLastSelectedIndex(index);
    }
  }, [processedDeals, lastSelectedIndex]);

  const handleRowSelect = useCallback((dealId: string, isSelected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(dealId);
      } else {
        newSet.delete(dealId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows(new Set(processedDeals.map(d => d.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [processedDeals]);

  const handleClearSelection = useCallback(() => {
    setSelectedRows(new Set());
    setLastSelectedIndex(-1);
  }, []);

  const handleBulkAction = useCallback((action: string) => {
  }, [selectedRows]);

  const toggleRowExpansion = useCallback((dealId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totals = useMemo(() => {
    return {
      totalValue: processedDeals.reduce((sum, deal) => sum + deal.value, 0),
      avgProbability: processedDeals.length > 0 
        ? processedDeals.reduce((sum, deal) => sum + deal.probability, 0) / processedDeals.length 
        : 0,
      count: processedDeals.length
    };
  }, [processedDeals]);

  const handleColumnResize = useCallback((columnKey: string, newWidth: number) => {
    const updatedColumns = columns.map(col =>
      col.key === columnKey ? { ...col, width: newWidth } : col
    );
    onColumnsChange(updatedColumns);
  }, [columns, onColumnsChange]);

  const availableStatuses = useMemo(() => 
    Array.from(new Set(deals.map(deal => deal.status))), [deals]
  );
  
  const availableOwners = useMemo(() => 
    Array.from(new Set(deals.map(deal => deal.owner))), [deals]
  );

  const visibleColumns = columns.filter(col => col.visible);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const numCols = visibleColumns.length;
    const numRows = processedDeals.length;

    if (!focusedCell && numRows > 0) {
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        setFocusedCell({ row: 0, col: 0 });
        e.preventDefault();
        return;
      }
    }

    if (!focusedCell) return;

    switch (e.key) {
      case 'Escape':
        setFocusedCell(null);
        setEditingCell(null);
        e.preventDefault();
        break;
      case 'Enter':
        if (editingCell) {
          setEditingCell(null);
        } else {
          setEditingCell({ ...focusedCell });
        }
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (focusedCell.row < numRows - 1) {
          setFocusedCell({ ...focusedCell, row: focusedCell.row + 1 });
        }
        e.preventDefault();
        break;
      case 'ArrowUp':
        if (focusedCell.row > 0) {
          setFocusedCell({ ...focusedCell, row: focusedCell.row - 1 });
        }
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (focusedCell.col < numCols - 1) {
          setFocusedCell({ ...focusedCell, col: focusedCell.col + 1 });
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
        if (focusedCell.col > 0) {
          setFocusedCell({ ...focusedCell, col: focusedCell.col - 1 });
        }
        e.preventDefault();
        break;
    }
  }, [focusedCell, editingCell, visibleColumns.length, processedDeals.length]);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    setFocusedCell({ row: rowIndex, col: colIndex });
  }, []);

  const handleEditChange = useCallback((value: string, rowIndex: number, colIndex: number) => {
    console.log(`Editing cell [${rowIndex}, ${colIndex}] with value: ${value}`);
  }, []);

  const updateDealCloseDate = (dealId: string, newDate: Date) => {
    console.log('Updating deal close date:', dealId, newDate);
    console.log('Date updated for deal:', dealId, 'to:', format(newDate, 'yyyy-MM-dd'));
    setCalendarOpen({ dealId: '', isOpen: false });
  };

  return (
    <div 
      className="flex flex-col h-full bg-background" 
      onKeyDown={handleKeyDown} 
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-table-border bg-table-header">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-foreground">Deals</h1>
          <div className="flex items-center gap-3">
            <ColumnControls 
              columns={columns}
              onColumnsChange={onColumnsChange}
            />
          </div>
          

        </div>
        
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        onFiltersChange={setActiveFilters}
        availableStatuses={availableStatuses}
        availableOwners={availableOwners}
      />

      <BulkActionsToolbar
        selectedCount={selectedRows.size}
        onClearSelection={handleClearSelection}
        onBulkAction={handleBulkAction}
      />

      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-6">
          {groupedDeals.map((group, groupIndex) => (
            <div key={group.key} className="space-y-4">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <span className={group.color}>{group.name}</span>
                  <Badge variant="secondary">
                    {group.total}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Deals: {group.total}</span>
                  <span>Value: {formatCurrency(group.totalValue)}</span>
                </div>
              </div>

              {/* Group Table */}
              <div className="border rounded-lg overflow-hidden bg-card">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="w-12 p-3 text-left">
                        <Checkbox
                          checked={group.deals.length > 0 && group.deals.every(deal => selectedRows.has(deal.id))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              group.deals.forEach(deal => handleRowSelect(deal.id, true));
                            } else {
                              group.deals.forEach(deal => handleRowSelect(deal.id, false));
                            }
                          }}
                        />
                      </th>
                      <th className="w-12 p-3 text-left"></th>
                      {visibleColumns.map((column) => (
                        <th
                          key={column.key}
                          className="group relative p-3 text-left font-medium text-sm border-r border-table-border  hover:bg-table-hover transition-colors select-none"
                          style={{ width: column.width }}
                          onClick={(e) => handleSort(column.key, e.shiftKey)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{column.title}</span>
                            {column.sortable && getSortIndicator(column.key)}
                          </div>
                        </th>
                      ))}
                      <th className="w-12 p-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.deals.map((deal, index) => (
              <React.Fragment key={deal.id}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <tr
                      className={cn(
                        "border-b border-table-border hover:bg-table-hover transition-colors ",
                        selectedRows.has(deal.id) && "bg-table-selected"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(deal.id, index, e);
                      }}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedRows.has(deal.id)}
                          onCheckedChange={(checked) => handleRowSelect(deal.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      {visibleColumns.map((column, colIndex) => {
                        const isFocused = focusedCell?.row === index && focusedCell?.col === colIndex;
                        const isEditing = editingCell?.row === index && editingCell?.col === colIndex;
                        const isEditable = ['dealName', 'company', 'owner', 'value', 'probability', 'source'].includes(column.key);
                        
                        return (
                          <td 
                            key={column.key} 
                            className={cn(
                              "p-3 border-r border-table-border text-sm transition-all duration-150 ",
                              isFocused && "ring-2 ring-primary ring-inset bg-primary/5 relative z-10",
                              isEditing && "bg-primary/10"
                            )}
                            onClick={() => handleCellClick(index, colIndex)}
                            style={{
                              background: isFocused ? 'rgba(var(--primary-rgb), 0.05)' : undefined,
                            }}
                          >
                            <TableTooltip deal={deal} field={column.key}>
                              {isEditing && isEditable ? (
                                <Input 
                                  className="h-7 text-sm border-0 shadow-none bg-transparent p-0 focus:ring-2 focus:ring-primary"
                                  defaultValue={
                                    column.key === 'dealName' ? deal.dealName :
                                    column.key === 'company' ? deal.company :
                                    column.key === 'owner' ? deal.owner :
                                    column.key === 'value' ? deal.value.toString() :
                                    column.key === 'probability' ? deal.probability.toString() :
                                    column.key === 'source' ? deal.source :
                                    ''
                                  }
                                  onChange={(e) => handleEditChange(e.target.value, index, colIndex)}
                                  onBlur={() => setEditingCell(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setEditingCell(null);
                                      e.stopPropagation();
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                      e.stopPropagation();
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <div className={cn(
                                  "min-h-[20px] flex items-center",
                                  isFocused && "font-medium"
                                )}>
                                  {column.key === 'dealName' && (
                                    <div className="font-medium text-foreground">{deal.dealName}</div>
                                  )}
                                  {column.key === 'company' && deal.company}
                                  {column.key === 'owner' && deal.owner}
                                  {column.key === 'status' && <StatusBadge status={deal.status} />}
                                  {column.key === 'value' && formatCurrency(deal.value)}
                                  {column.key === 'probability' && `${deal.probability}%`}
                                  {column.key === 'expectedCloseDate' && (
                                    <Popover 
                                      open={calendarOpen.dealId === deal.id && calendarOpen.isOpen}
                                      onOpenChange={(open) => setCalendarOpen({ dealId: deal.id, isOpen: open })}
                                    >
                                      <PopoverTrigger asChild>
                                        <div className="flex items-center gap-2  hover:bg-muted/50 p-1 rounded transition-colors">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            {formatDate(deal.expectedCloseDate)}
                                          </span>
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                          mode="single"
                                          selected={new Date(deal.expectedCloseDate)}
                                          onSelect={(date) => date && updateDealCloseDate(deal.id, date)}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                  {column.key === 'lastActivity' && formatDate(deal.lastActivity)}
                                  {column.key === 'source' && deal.source}
                                  
                                  {/* Show edit hint for focused editable cells */}
                                  {isFocused && isEditable && !isEditing && (
                                    <span className="ml-2 text-xs text-muted-foreground opacity-70">
                                      Press Enter to edit
                                    </span>
                                  )}
                                </div>
                              )}
                            </TableTooltip>
                          </td>
                        );
                      })}
                      <td className="p-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(deal.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {expandedRows.has(deal.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem>Edit Deal</ContextMenuItem>
                    <ContextMenuItem>Duplicate</ContextMenuItem>
                    <ContextMenuItem>Add Note</ContextMenuItem>
                    <ContextMenuItem className="text-destructive">Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                
                {/* Expanded row content */}
                {expandedRows.has(deal.id) && (
                  <tr className="bg-muted/30">
                    <td colSpan={visibleColumns.length + 3} className="p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Notes: </span>
                            {deal.notes || 'No notes'}
                          </div>
                          <div>
                            <span className="font-medium">Source: </span>
                            {deal.source}
                          </div>
                        </div>
                        {deal.activities && deal.activities.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recent Activities</h4>
                            <div className="space-y-2">
                              {deal.activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-3 text-sm p-2 bg-background rounded border">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  <div className="flex-1">
                                    <div className="font-medium">{activity.description}</div>
                                    <div className="text-muted-foreground text-xs">
                                      {activity.user} • {formatDate(activity.date)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals bar */}
      <div className="border-t border-table-border bg-table-header p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-medium">Total Deals: </span>
              <span className="text-foreground">{totals.count}</span>
            </div>
            <div>
              <span className="font-medium">Total Value: </span>
              <span className="text-foreground">{formatCurrency(totals.totalValue)}</span>
            </div>
            <div>
              <span className="font-medium">Avg Probability: </span>
              <span className="text-foreground">{Math.round(totals.avgProbability)}%</span>
            </div>
          </div>
          <div className="text-muted-foreground">
            {selectedRows.size > 0 && `${selectedRows.size} selected`}
          </div>
        </div>
      </div>
    </div>
  );
}