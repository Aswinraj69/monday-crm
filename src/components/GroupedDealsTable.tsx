import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Building,
  DollarSign,
  Edit,
  Check,
  X,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Download,
  Settings,
  Pin,
  PinOff,
  Star,
  StarOff,
  Archive,
  Share,
  Link,
  ExternalLink,
  Group
} from 'lucide-react';
import { Deal, SortConfig, DealStatus, ColumnConfig, GroupByField, DealGroup } from '@/types/deals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ColumnControls } from '@/components/ColumnControls';
import { ResizeHandle } from '@/components/ResizeHandle';
import { StatusBadge } from '@/components/StatusBadge';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { TotalsBar } from '@/components/TotalsBar';
import { BulkActionsToolbar } from '@/components/BulkActionsToolbar';
import { defaultColumns } from '@/data/mockDeals';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface GroupedDealsTableProps {
  deals: Deal[];
  groupByField?: GroupByField | null;
}

interface CellPosition {
  groupIndex: number;
  rowIndex: number;
  columnIndex: number;
}

export function GroupedDealsTable({ deals, groupByField }: GroupedDealsTableProps) {
  const { saveState, loadState } = useLocalStorage();
  
  const savedState = loadState();
  
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Active Deals']));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig[]>(savedState.sortConfigs || []);
  const [editingCell, setEditingCell] = useState<{ dealId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [columns, setColumns] = useState<ColumnConfig[]>(savedState.columns || defaultColumns);
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);
  const [dealsData, setDealsData] = useState<Deal[]>(deals);
  const [lastSelectedRow, setLastSelectedRow] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState<{ dealId: string; isOpen: boolean }>({ dealId: '', isOpen: false });
  const [favoriteDeals, setFavoriteDeals] = useState<Set<string>>(new Set());
  const [ownerSearch, setOwnerSearch] = useState<string>('');
  
  const tableRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    setDealsData(deals);
  }, [deals]);

  useEffect(() => {
    saveState({
      sortConfigs: sortConfig,
      columns: columns
    });
  }, [sortConfig, columns, saveState]);

  const selectSingleRow = (dealId: string) => {
    setSelectedRows(new Set([dealId]));
    setLastSelectedRow(dealId);
  };

  const selectMultipleRows = (dealId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
    setLastSelectedRow(dealId);
  };

  const selectRangeRows = (dealId: string) => {
    if (!lastSelectedRow) {
      selectSingleRow(dealId);
      return;
    }

    const allDeals = groups.flatMap(group => group.deals);
    const lastIndex = allDeals.findIndex(deal => deal.id === lastSelectedRow);
    const currentIndex = allDeals.findIndex(deal => deal.id === dealId);
    
    if (lastIndex === -1 || currentIndex === -1) {
      selectSingleRow(dealId);
      return;
    }

    const startIndex = Math.min(lastIndex, currentIndex);
    const endIndex = Math.max(lastIndex, currentIndex);
    const rangeDeals = allDeals.slice(startIndex, endIndex + 1);
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      rangeDeals.forEach(deal => newSet.add(deal.id));
      return newSet;
    });
  };

  const handleRowSelection = (dealId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      selectMultipleRows(dealId);
    } else if (event.shiftKey) {
      selectRangeRows(dealId);
    } else {
      selectSingleRow(dealId);
    }
  };

  const handleSelectAll = (checked: boolean, groupDeals: Deal[]) => {
    if (checked) {
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        groupDeals.forEach(deal => newSet.add(deal.id));
        return newSet;
      });
    } else {
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        groupDeals.forEach(deal => newSet.delete(deal.id));
        return newSet;
      });
    }
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
    setLastSelectedRow(null);
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        setDealsData(prev => prev.filter(deal => !selectedRows.has(deal.id)));
        clearSelection();
        break;
      case 'archive':
        break;
      case 'duplicate':
        break;
      default:
        break;
    }
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const toggleRow = (dealId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => {
      const existing = prev.find(s => s.key === (column as keyof Deal));
      if (!existing) {
        return [{ key: column as keyof Deal, direction: 'asc' }];
      }
      return [{ key: column as keyof Deal, direction: existing.direction === 'asc' ? 'desc' : 'asc' }];
    });
  };

  const getSortIcon = (column: string) => {
    const sort = sortConfig.find(s => s.key === column);
    if (!sort) return <ArrowUpDown className="h-4 w-4" />;
    return sort.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const startEditingCell = (dealId: string, field: string, currentValue: string) => {
    setEditingCell({ dealId, field });
    setEditValue(currentValue);
    setFocusedCell(null);
  };

  const saveEdit = () => {
    if (editingCell) {
      setDealsData(prev => prev.map(deal => {
        if (deal.id === editingCell.dealId) {
          const updatedDeal = { ...deal };
          if (editingCell.field === 'dealName') {
            updatedDeal.dealName = editValue;
          } else if (editingCell.field === 'value') {
            updatedDeal.value = parseFloat(editValue) || 0;
          }
          return updatedDeal;
        }
        return deal;
      }));
    }
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const updateColumnWidth = (columnKey: string, width: number) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, width } : col
    ));
  };

  const updateDealStatus = (dealId: string, newStatus: DealStatus) => {
    setDealsData(prev => prev.map(deal => 
      deal.id === dealId ? { ...deal, status: newStatus } : deal
    ));
  };

  const updateDealOwner = (dealId: string, newOwner: string) => {
    setDealsData(prev => prev.map(deal => 
      deal.id === dealId ? { ...deal, owner: newOwner } : deal
    ));
  };

  const updateDealCloseDate = (dealId: string, newDate: Date) => {
    setDealsData(prev => prev.map(deal => 
      deal.id === dealId ? { ...deal, expectedCloseDate: format(newDate, 'yyyy-MM-dd') } : deal
    ));
    setCalendarOpen({ dealId: '', isOpen: false });
  };

  const applySorting = (dealsList: Deal[]): Deal[] => {
    if (sortConfig.length === 0) return dealsList;
    
    return [...dealsList].sort((a, b) => {
      for (const sort of sortConfig) {
        const aValue = a[sort.key];
        const bValue = b[sort.key];
        
        let comparison = 0;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        
        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  };

  const groupDeals = (): DealGroup[] => {
    if (!groupByField) {
      const activeDeals = dealsData.filter(deal => ['new', 'qualified', 'proposal'].includes(deal.status));
      const closedWonDeals = dealsData.filter(deal => deal.status === 'won');

      return [
        {
          name: 'Active Deals',
          key: 'active',
          deals: applySorting(activeDeals),
          total: activeDeals.length,
          totalValue: activeDeals.reduce((sum, deal) => sum + deal.value, 0),
          color: 'text-blue-600',
          bgColor: 'bg-[#0086c0]',
          expanded: expandedGroups.has('Active Deals')
        },
        {
          name: 'Closed Won',
          key: 'won',
          deals: applySorting(closedWonDeals),
          total: closedWonDeals.length,
          totalValue: closedWonDeals.reduce((sum, deal) => sum + deal.value, 0),
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          expanded: expandedGroups.has('Closed Won')
        }
      ];
    }

    const groupedDeals: DealGroup[] = [];
    const uniqueValues = [...new Set(dealsData.map(deal => deal[groupByField]))];

    uniqueValues.forEach(value => {
      const groupDeals = dealsData.filter(deal => deal[groupByField] === value);
      groupedDeals.push({
        name: String(value),
        key: String(value),
        deals: applySorting(groupDeals),
        total: groupDeals.length,
        totalValue: groupDeals.reduce((sum, deal) => sum + deal.value, 0),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        expanded: expandedGroups.has(String(value))
      });
    });

    return groupedDeals;
  };

  const visibleColumns = columns.filter(col => col.visible);
  const pinnedColumns = visibleColumns.filter(col => col.pinned);
  const scrollableColumns = visibleColumns.filter(col => !col.pinned);
  const groups = groupDeals();

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status as DealStatus} interactive showTooltip />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(dealsData.map(d => d.owner)));
  }, [dealsData]);

  const filteredOwners = useMemo(() => {
    const q = ownerSearch.trim().toLowerCase();
    if (!q) return uniqueOwners;
    return uniqueOwners.filter(o => o.toLowerCase().includes(q));
  }, [uniqueOwners, ownerSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCell || !focusedCell) return;
      
      const currentGroup = groups[focusedCell.groupIndex];
      if (!currentGroup) return;
      
      const totalColumns = visibleColumns.length + 3;
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (focusedCell.columnIndex < totalColumns - 1) {
            setFocusedCell({
              ...focusedCell,
              columnIndex: focusedCell.columnIndex + 1
            });
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedCell.columnIndex > 0) {
            setFocusedCell({
              ...focusedCell,
              columnIndex: focusedCell.columnIndex - 1
            });
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (focusedCell.rowIndex < currentGroup.deals.length - 1) {
            setFocusedCell({
              ...focusedCell,
              rowIndex: focusedCell.rowIndex + 1
            });
          } else if (focusedCell.groupIndex < groups.length - 1) {
            setFocusedCell({
              groupIndex: focusedCell.groupIndex + 1,
              rowIndex: 0,
              columnIndex: focusedCell.columnIndex
            });
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (focusedCell.rowIndex > 0) {
            setFocusedCell({
              ...focusedCell,
              rowIndex: focusedCell.rowIndex - 1
            });
          } else if (focusedCell.groupIndex > 0) {
            const prevGroup = groups[focusedCell.groupIndex - 1];
            setFocusedCell({
              groupIndex: focusedCell.groupIndex - 1,
              rowIndex: prevGroup.deals.length - 1,
              columnIndex: focusedCell.columnIndex
            });
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          if (focusedCell.columnIndex >= 2 && focusedCell.columnIndex < 2 + visibleColumns.length) {
            const columnIndex = focusedCell.columnIndex - 2;
            const column = visibleColumns[columnIndex];
            const deal = currentGroup.deals[focusedCell.rowIndex];
            
            if (column.key === 'dealName' || column.key === 'value') {
              startEditingCell(deal.id, column.key, String(deal[column.key]));
            }
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          setFocusedCell(null);
          break;
      }
    };
    
    if (!editingCell) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [focusedCell, editingCell, visibleColumns, groups]);

  const setCellRef = (key: string, element: HTMLElement | null) => {
    if (element) {
      cellRefs.current.set(key, element);
    } else {
      cellRefs.current.delete(key);
    }
  };

  const renderTableCell = (deal: Deal, columnKey: keyof Deal, groupIndex: number, rowIndex: number, columnIndex: number) => {
    const isEditing = editingCell?.dealId === deal.id && editingCell?.field === columnKey;
    const isFocused = focusedCell?.groupIndex === groupIndex && 
                     focusedCell?.rowIndex === rowIndex && 
                     focusedCell?.columnIndex === columnIndex;
    const cellKey = `${groupIndex}-${rowIndex}-${columnIndex}`;
    
    const baseCellProps = {
      key: columnKey,
      className: cn(
        "transition-colors relative",
        isFocused && "ring-2 ring-primary ring-inset bg-primary/5"
      ),
      tabIndex: isFocused ? 0 : -1,
      ref: (el: HTMLTableCellElement) => setCellRef(cellKey, el),
    };
    
    switch (columnKey) {
      case 'dealName':
        return (
          <TableCell 
            {...baseCellProps}
            className={cn(baseCellProps.className, "font-medium  hover:bg-muted/50")}
            onClick={(e) => {
              e.stopPropagation();
              setFocusedCell({ groupIndex, rowIndex, columnIndex });
              if (!isEditing) {
                startEditingCell(deal.id, 'dealName', deal.dealName);
              }
            }}
          >
            {isEditing ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={editValue}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                  }}
                  className="h-8 text-sm flex-1"
                  autoFocus
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      saveEdit();
                    }
                    if (e.key === 'Escape') {
                      cancelEdit();
                    }
                  }}
                  onBlur={(e) => {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || (!relatedTarget.closest('[data-save-button]') && !relatedTarget.closest('[data-cancel-button]'))) {
                      saveEdit();
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  data-save-button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEdit();
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  data-cancel-button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEdit();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {deal.dealName}
                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100" />
              </div>
            )}
          </TableCell>
        );
        
      case 'company':
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{deal.company}</span>
            </div>
          </TableCell>
        );
        
      case 'status':
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className=" hover:bg-muted/50 p-1 rounded">
                  {getStatusBadge(deal.status)}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-lg z-50">
                <DropdownMenuItem onClick={() => updateDealStatus(deal.id, 'new')}>
                  <StatusBadge status="new" showTooltip={false} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateDealStatus(deal.id, 'proposal')}>
                  <StatusBadge status="proposal" showTooltip={false} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateDealStatus(deal.id, 'won')}>
                  <StatusBadge status="won" showTooltip={false} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateDealStatus(deal.id, 'lost')}>
                  <StatusBadge status="lost" showTooltip={false} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        );
        
      case 'owner':
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <DropdownMenu onOpenChange={(open) => { if (!open) setOwnerSearch(''); }}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2  hover:bg-muted/50 p-1 rounded">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-muted">
                      {getInitials(deal.owner)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{deal.owner}</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-lg z-50 w-64 p-0">
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search owners..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {filteredOwners.length > 0 ? (
                  filteredOwners.map((owner) => (
                    <DropdownMenuItem key={owner} onClick={() => updateDealOwner(deal.id, owner)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{getInitials(owner)}</AvatarFallback>
                        </Avatar>
                        {owner}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No owners found</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        );
        
      case 'value':
        return (
          <TableCell 
            {...baseCellProps}
            className={cn(baseCellProps.className, "font-medium  hover:bg-muted/50")}
            onClick={(e) => {
              e.stopPropagation();
              setFocusedCell({ groupIndex, rowIndex, columnIndex });
              if (!isEditing) {
                startEditingCell(deal.id, 'value', deal.value.toString());
              }
            }}
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                  }}
                  className="h-8 text-sm w-32"
                  autoFocus
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      saveEdit();
                    }
                    if (e.key === 'Escape') {
                      cancelEdit();
                    }
                  }}
                  onBlur={(e) => {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || (!relatedTarget.closest('[data-save-button]') && !relatedTarget.closest('[data-cancel-button]'))) {
                      saveEdit();
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  data-save-button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEdit();
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  data-cancel-button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEdit();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              formatCurrency(deal.value)
            )}
          </TableCell>
        );
        
      case 'probability':
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <span className="text-sm">{deal.probability}%</span>
          </TableCell>
        );
        
      case 'expectedCloseDate':
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <Popover 
              open={calendarOpen.dealId === deal.id && calendarOpen.isOpen}
              onOpenChange={(open) => setCalendarOpen({ dealId: deal.id, isOpen: open })}
            >
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2  hover:bg-muted/50 p-1 rounded transition-colors">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
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
          </TableCell>
        );
        
      case 'lastActivity':
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <span className="text-sm text-muted-foreground">
              {new Date(deal.lastActivity).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </TableCell>
        );
        
      case 'source':
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <span className="text-sm">{deal.source}</span>
          </TableCell>
        );
        
      default:
        return (
          <TableCell {...baseCellProps} onClick={() => setFocusedCell({ groupIndex, rowIndex, columnIndex })}>
            <span className="text-sm">{String(deal[columnKey])}</span>
          </TableCell>
        );
    }
  };

  const handleColumnContextMenu = (columnKey: string, action: string) => {
    switch (action) {
      case 'sort-asc':
        handleSort(columnKey);
        break;
      case 'sort-desc':
        handleSort(columnKey);
        break;
      case 'hide':
        setColumns(prev => prev.map(col => 
          col.key === columnKey ? { ...col, visible: false } : col
        ));
        break;
      case 'pin':
        setColumns(prev => prev.map(col => 
          col.key === columnKey ? { ...col, pinned: true } : col
        ));
        break;
      case 'unpin':
        setColumns(prev => prev.map(col => 
          col.key === columnKey ? { ...col, pinned: false } : col
        ));
        break;
      case 'filter':
        break;
      case 'export':
        
        break;
    }
  };

  const handleRowContextMenu = (dealId: string, action: string) => {
    switch (action) {
      case 'edit':
        const deal = dealsData.find(d => d.id === dealId);
        if (deal) {
          startEditingCell(dealId, 'dealName', deal.dealName);
        }
        break;
      case 'duplicate':
        const dealToDuplicate = dealsData.find(d => d.id === dealId);
        if (dealToDuplicate) {
          const newDeal = {
            ...dealToDuplicate,
            id: Date.now().toString(),
            dealName: `${dealToDuplicate.dealName} (Copy)`
          };
          setDealsData(prev => [...prev, newDeal]);
        }
        break;
      case 'delete':
        setDealsData(prev => prev.filter(d => d.id !== dealId));
        setSelectedRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(dealId);
          return newSet;
        });
        break;
      case 'archive':
        break;
      case 'share':
        
        break;
      case 'favorite':
        setFavoriteDeals(prev => {
          const newSet = new Set(prev);
          if (newSet.has(dealId)) {
            newSet.delete(dealId);
          } else {
            newSet.add(dealId);
          }
          return newSet;
        });
        break;
      case 'copy-link':
        navigator.clipboard.writeText(`${window.location.origin}/deals/${dealId}`);
        break;
    }
  };

  return (
    <div className="h-full bg-background flex flex-col" ref={tableRef} tabIndex={0}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar 
        selectedCount={selectedRows.size}
        onClearSelection={clearSelection}
        onBulkAction={handleBulkAction}
      />

      {/* Column Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Table Settings:</span>
          <ColumnControls columns={columns} onColumnsChange={setColumns} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-6">
          {groups.map((group, groupIndex) => (
            <div key={group.name} className="space-y-4">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="flex items-center gap-3 text-lg font-semibold hover:bg-muted/50 p-2 rounded-md transition-colors"
                >
                  {expandedGroups.has(group.name) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={group.color}>{group.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {group.total}
                  </Badge>
                </button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Deals: {group.total}</span>
                  <span>Value: {formatCurrency(group.totalValue)}</span>
                </div>
              </div>

              {/* Group Content */}
              {expandedGroups.has(group.name) && (
                <div className="border rounded-lg overflow-hidden bg-card">
                  <div className="flex w-full">
                    {/* Essential Columns Section (Always Visible) */}
                    <div className="flex-shrink-0 border-r border-border">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox 
                                checked={group.deals.length > 0 && group.deals.every(deal => selectedRows.has(deal.id))}
                                onCheckedChange={(checked) => handleSelectAll(!!checked, group.deals)}
                              />
                            </TableHead>
                            <TableHead className="w-12"></TableHead>
                            
                            {/* Pinned Columns */}
                            {pinnedColumns.map((column) => (
                              <ContextMenu key={column.key}>
                                <ContextMenuTrigger asChild>
                                  <TableHead 
                                    className={cn(
                                      "relative bg-primary/5 border-r border-primary/20 hover:bg-muted/50 transition-colors",
                                      "border-b border-border"
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => handleSort(column.key)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Pin className="h-3 w-3 text-primary" />
                                      <span className="font-medium">{column.title}</span>
                                      {getSortIcon(column.key)}
                                    </div>
                                    {column.resizable && (
                                      <ResizeHandle 
                                        onResize={(width) => updateColumnWidth(column.key, width)}
                                      />
                                    )}
                                  </TableHead>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-56">
                                  <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'sort-asc')}>
                                    <ArrowUp className="h-4 w-4 mr-2" />
                                    Sort Ascending
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'sort-desc')}>
                                    <ArrowDown className="h-4 w-4 mr-2" />
                                    Sort Descending
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'filter')}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter by {column.title}
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'unpin')}>
                                    <PinOff className="h-4 w-4 mr-2" />
                                    Unpin Column
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'hide')}>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide Column
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'export')}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Column
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.deals.map((deal, rowIndex) => (
                            <ContextMenu key={deal.id}>
                              <ContextMenuTrigger asChild>
                                <React.Fragment>
                                  <TableRow 
                                    className={cn(
                                      "hover:bg-muted/30 group ",
                                      selectedRows.has(deal.id) && "bg-primary/5 border-l-2 border-primary",
                                      favoriteDeals.has(deal.id) && "bg-yellow-50/50"
                                    )}
                                    onClick={(e) => handleRowSelection(deal.id, e)}
                                  >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                      <Checkbox 
                                        checked={selectedRows.has(deal.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedRows(prev => new Set([...prev, deal.id]));
                                          } else {
                                            setSelectedRows(prev => {
                                              const newSet = new Set(prev);
                                              newSet.delete(deal.id);
                                              return newSet;
                                            });
                                          }
                                          setLastSelectedRow(deal.id);
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell className="w-12">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleRow(deal.id);
                                        }}
                                        className="p-2 hover:bg-muted/50 rounded transition-colors flex items-center justify-center w-8 h-8"
                                        title={expandedRows.has(deal.id) ? 'Collapse details' : 'Expand details'}
                                      >
                                        {expandedRows.has(deal.id) ? (
                                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </button>
                                    </TableCell>
                                    
                                    {/* Pinned Column Cells */}
                                    {pinnedColumns.map((column, columnIndex) => 
                                      renderTableCell(deal, column.key, groupIndex, rowIndex, columnIndex + 2)
                                    )}
                                  </TableRow>

                                  {/* Expanded Row Content for Essential Section */}
                                  {expandedRows.has(deal.id) && (
                                    <TableRow className="bg-muted/20 border-l-4 border-primary/20">
                                      <TableCell colSpan={pinnedColumns.length + 2}>
                                        <div className="p-4 text-sm text-muted-foreground">
                                          <span className="font-medium">Deal: {deal.dealName}</span>
                                          <br />
                                          <span>Company: {deal.company}</span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              </ContextMenuTrigger>
                              <ContextMenuContent className="w-64">
                                <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'edit')}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Deal
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'duplicate')}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate Deal
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'favorite')}>
                                  {favoriteDeals.has(deal.id) ? (
                                    <>
                                      <StarOff className="h-4 w-4 mr-2" />
                                      Remove from Favorites
                                    </>
                                  ) : (
                                    <>
                                      <Star className="h-4 w-4 mr-2" />
                                      Add to Favorites
                                    </>
                                  )}
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'share')}>
                                  <Share className="h-4 w-4 mr-2" />
                                  Share Deal
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'copy-link')}>
                                  <Link className="h-4 w-4 mr-2" />
                                  Copy Link
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'archive')}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive Deal
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem 
                                  onClick={() => handleRowContextMenu(deal.id, 'delete')}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Deal
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Scrollable Columns Section */}
                    <div className="flex-1 overflow-x-auto min-w-0">
                      <div className="min-w-max">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              {/* Scrollable Columns */}
                              {scrollableColumns.map((column) => (
                                <ContextMenu key={column.key}>
                                  <ContextMenuTrigger asChild>
                                    <TableHead 
                                      className={cn(
                                        "relative hover:bg-muted/50 transition-colors",
                                        "border-b border-border"
                                      )}
                                      style={{ width: column.width }}
                                      onClick={() => handleSort(column.key)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{column.title}</span>
                                        {getSortIcon(column.key)}
                                      </div>
                                      {column.resizable && (
                                        <ResizeHandle 
                                          onResize={(width) => updateColumnWidth(column.key, width)}
                                        />
                                      )}
                                    </TableHead>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent className="w-56">
                                    <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'sort-asc')}>
                                      <ArrowUp className="h-4 w-4 mr-2" />
                                      Sort Ascending
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'sort-desc')}>
                                      <ArrowDown className="h-4 w-4 mr-2" />
                                      Sort Descending
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'filter')}>
                                      <Filter className="h-4 w-4 mr-2" />
                                      Filter by {column.title}
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'pin')}>
                                      <Pin className="h-4 w-4 mr-2" />
                                      Pin Column
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'hide')}>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Hide Column
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'export')}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Export Column
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              ))}
                              
                              {/* Fixed Columns */}
                              <TableHead className="w-32">Activities timeline</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.deals.map((deal, rowIndex) => (
                              <ContextMenu key={deal.id}>
                                <ContextMenuTrigger asChild>
                                  <React.Fragment>
                                    <TableRow 
                                      className={cn(
                                        "hover:bg-muted/30 group h-12",
                                        selectedRows.has(deal.id) && "bg-primary/5",
                                        favoriteDeals.has(deal.id) && "bg-yellow-50/50"
                                      )}
                                      onClick={(e) => handleRowSelection(deal.id, e)}
                                    >
                                      {/* Scrollable Column Cells */}
                                      {scrollableColumns.map((column, columnIndex) => 
                                        renderTableCell(deal, column.key, groupIndex, rowIndex, columnIndex)
                                      )}
                                      
                                      {/* Fixed Cells */}
                                      <TableCell>
                                        <ActivityTimeline activities={deal.activities} />
                                      </TableCell>
                                    </TableRow>

                                    {/* Expanded Row Content for Scrollable Section */}
                                    {expandedRows.has(deal.id) && (
                                      <TableRow className="bg-muted/20 border-l-4 border-primary/20">
                                        <TableCell colSpan={scrollableColumns.length + 1}>
                                          <div className="p-6 space-y-4">
                                            {/* Sub-items Header */}
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-semibold text-sm text-muted-foreground">
                                                Deal Activities & Sub-items
                                              </h4>
                                              <Badge variant="outline" className="text-xs">
                                                {deal.activities?.length || 0} activities
                                              </Badge>
                                            </div>
                                            
                                            {/* Column Headers */}
                                            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                                              <div>Task/Activity</div>
                                              <div>Owner</div>
                                              <div>Status</div>
                                              <div>Date</div>
                                              <div>Actions</div>
                                            </div>
                                            
                                            {/* Activities List */}
                                            {deal.activities && deal.activities.length > 0 ? (
                                              deal.activities.slice(0, 5).map((activity, index) => (
                                                <div key={activity.id} className="grid grid-cols-5 gap-4 text-sm py-3 border-b last:border-b-0 hover:bg-muted/30 rounded transition-colors">
                                                  <div className="flex items-center gap-3">
                                                    <Checkbox className="h-4 w-4" />
                                                    <div className="flex items-center gap-2">
                                                      <div className={`w-2 h-2 rounded-full ${
                                                        activity.type === 'call' ? 'bg-blue-500' :
                                                        activity.type === 'email' ? 'bg-green-500' :
                                                        activity.type === 'meeting' ? 'bg-purple-500' :
                                                        'bg-orange-500'
                                                      }`} />
                                                      <span className="font-medium">{activity.description}</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                      <AvatarFallback className="text-xs">
                                                        {getInitials(activity.user)}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <span>{activity.user}</span>
                                                  </div>
                                                  <div>
                                                    {index === 0 && (
                                                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                                        In Progress
                                                      </Badge>
                                                    )}
                                                    {index === 1 && (
                                                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                        Pending
                                                      </Badge>
                                                    )}
                                                    {index > 1 && (
                                                      <Badge className="bg-green-100 text-green-700 border-green-200">
                                                        Completed
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <div className="text-muted-foreground">
                                                    {new Date(activity.date).toLocaleDateString('en-US', {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      year: 'numeric'
                                                    })}
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="ghost" className="h-6 px-2">
                                                      <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-6 px-2">
                                                      <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              ))
                                            ) : (
                                              <div className="text-center py-8 text-muted-foreground">
                                                <div className="text-lg mb-2">📋</div>
                                                <div className="text-sm">No activities yet</div>
                                                <div className="text-xs">Add your first activity to get started</div>
                                              </div>
                                            )}
                                            
                                            {/* Add New Activity Button */}
                                            <div className="pt-3 border-t">
                                              <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-2 font-medium">
                                                <Plus className="h-4 w-4" />
                                                Add new sub-item
                                              </button>
                                            </div>
                                            
                                            {/* Deal Notes Section */}
                                            {deal.notes && (
                                              <div className="pt-4 border-t">
                                                <div className="text-sm font-medium text-muted-foreground mb-2">Deal Notes:</div>
                                                <div className="text-sm bg-muted/30 p-3 rounded border-l-4 border-primary/30">
                                                  {deal.notes}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </React.Fragment>
                                </ContextMenuTrigger>
                              </ContextMenu>
                            ))}
                            
                            {/* Add Deal Row */}
                            <TableRow className="hover:bg-muted/30">
                              <TableCell colSpan={scrollableColumns.length + 1}>
                                <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-full py-2">
                                  <Plus className="h-4 w-4" />
                                  Add deal
                                </button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add New Group */}
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-2 rounded-md transition-colors">
            <Plus className="h-4 w-4" />
            Add new group
          </button>
        </div>
      </div>

      {/* Enhanced Totals Bar - Pinned to Bottom */}
      <div className="sticky bottom-0 bg-background border-t border-border shadow-lg">
        <TotalsBar 
          deals={dealsData} 
          visibleColumns={visibleColumns.map(col => ({ key: col.key, title: col.title }))} 
        />
      </div>
    </div>
  );
}