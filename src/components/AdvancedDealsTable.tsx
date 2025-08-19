import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Edit3,
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
import { Deal, SortConfig, FilterConfig, ColumnConfig, GroupByField, DealGroup } from '@/types/deals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AdvancedDealsTableProps {
  deals: Deal[];
  columns: ColumnConfig[];
  onColumnChange: (columns: ColumnConfig[]) => void;
}

export function AdvancedDealsTable({ deals, columns, onColumnChange }: AdvancedDealsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: [],
    owner: [],
    valueMin: 0,
    valueMax: 0,
    search: ''
  });
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [calendarOpen, setCalendarOpen] = useState<{ dealId: string; isOpen: boolean }>({ dealId: '', isOpen: false });
  const [pinnedColumns, setPinnedColumns] = useState<Set<string>>(new Set());
  const [favoriteDeals, setFavoriteDeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedCell) return;

      const visibleColumns = columns.filter(col => col.visible);
      const maxRow = filteredAndSortedDeals.length - 1;
      const maxCol = visibleColumns.length - 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedCell(prev => prev ? {
            ...prev,
            row: Math.max(0, prev.row - 1)
          } : null);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedCell(prev => prev ? {
            ...prev,
            row: Math.min(maxRow, prev.row + 1)
          } : null);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedCell(prev => prev ? {
            ...prev,
            col: Math.max(0, prev.col - 1)
          } : null);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedCell(prev => prev ? {
            ...prev,
            col: Math.min(maxCol, prev.col + 1)
          } : null);
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedCell) {
            const deal = filteredAndSortedDeals[focusedCell.row];
            const column = visibleColumns[focusedCell.col];
            setEditingCell({ id: deal.id, field: column.key });
          }
          break;
        case 'Escape':
          e.preventDefault();
          setEditingCell(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, deals, columns]);

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals.filter(deal => {
      if (filterConfig.status && filterConfig.status.length > 0) {
        if (!filterConfig.status.includes(deal.status)) return false;
      }
      if (filterConfig.owner && filterConfig.owner.length > 0) {
        if (!filterConfig.owner.includes(deal.owner)) return false;
      }
      if (filterConfig.valueMin && deal.value < filterConfig.valueMin) return false;
      if (filterConfig.valueMax && deal.value > filterConfig.valueMax) return false;
      if (filterConfig.search) {
        const searchLower = filterConfig.search.toLowerCase();
        return deal.dealName.toLowerCase().includes(searchLower) ||
               deal.company.toLowerCase().includes(searchLower) ||
               deal.owner.toLowerCase().includes(searchLower);
      }
      return true;
    });

    if (sortConfig.length > 0) {
      filtered.sort((a, b) => {
        for (const sort of sortConfig) {
          const aVal = a[sort.key];
          const bVal = b[sort.key];
          
          let comparison = 0;
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            comparison = aVal.localeCompare(bVal);
          } else if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
          } else {
            comparison = String(aVal).localeCompare(String(bVal));
          }
          
          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [deals, filterConfig, sortConfig]);

  const toggleRowSelection = useCallback((dealId: string, isCtrlClick = false) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (isCtrlClick) {
        if (newSelection.has(dealId)) {
          newSelection.delete(dealId);
        } else {
          newSelection.add(dealId);
        }
      } else {
        newSelection.clear();
        newSelection.add(dealId);
      }
      return newSelection;
    });
  }, []);

  const toggleAllRows = useCallback(() => {
    setSelectedRows(prev => {
      if (prev.size === filteredAndSortedDeals.length) {
        return new Set();
      } else {
        return new Set(filteredAndSortedDeals.map(deal => deal.id));
      }
    });
  }, [filteredAndSortedDeals]);

  const handleSort = useCallback((key: keyof Deal, isShiftClick = false) => {
    setSortConfig(prev => {
      if (!isShiftClick) {
        const existing = prev.find(s => s.key === key);
        if (existing) {
          if (existing.direction === 'asc') {
            return [{ key, direction: 'desc' }];
          } else {
            return [];
          }
        } else {
          return [{ key, direction: 'asc' }];
        }
      } else {
        const existingIndex = prev.findIndex(s => s.key === key);
        if (existingIndex >= 0) {
          const newSort = [...prev];
          if (newSort[existingIndex].direction === 'asc') {
            newSort[existingIndex].direction = 'desc';
          } else {
            newSort.splice(existingIndex, 1);
          }
          return newSort;
        } else {
          return [...prev, { key, direction: 'asc' }];
        }
      }
    });
  }, []);

  const toggleRowExpansion = useCallback((dealId: string) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(dealId)) {
        newExpanded.delete(dealId);
      } else {
        newExpanded.add(dealId);
      }
      return newExpanded;
    });
  }, []);

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    onColumnChange(newColumns);
  }, [columns, onColumnChange]);

  const toggleColumnVisibility = useCallback((key: string) => {
    const newColumns = columns.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onColumnChange(newColumns);
  }, [columns, onColumnChange]);

  const handleCellEdit = useCallback((dealId: string, field: string, value: any) => {
    setEditingCell(null);
  }, []);

  const updateDealCloseDate = (dealId: string, newDate: Date) => {
    setCalendarOpen({ dealId: '', isOpen: false });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'Discovery', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      qualified: { label: 'Discovery', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      proposal: { label: 'Proposal', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
      won: { label: 'Won', className: 'bg-green-100 text-green-800 border-green-200' },
      lost: { label: 'Lost', className: 'bg-red-100 text-red-800 border-red-200' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totals = useMemo(() => {
    return {
      count: filteredAndSortedDeals.length,
      totalValue: filteredAndSortedDeals.reduce((sum, deal) => sum + deal.value, 0),
      avgValue: filteredAndSortedDeals.length > 0 
        ? filteredAndSortedDeals.reduce((sum, deal) => sum + deal.value, 0) / filteredAndSortedDeals.length 
        : 0,
      avgProbability: filteredAndSortedDeals.length > 0
        ? filteredAndSortedDeals.reduce((sum, deal) => sum + deal.probability, 0) / filteredAndSortedDeals.length
        : 0
    };
  }, [filteredAndSortedDeals]);

  const visibleColumns = columns.filter(col => col.visible);

  const getSortIcon = (columnKey: string) => {
    const sort = sortConfig.find(s => s.key === columnKey);
    if (!sort) return null;

    if (sort.direction === 'asc') {
      return <ArrowUp className="h-3 w-3 text-muted-foreground" />;
    } else {
      return <ArrowDown className="h-3 w-3 text-muted-foreground" />;
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
        const newColumns = columns.map(col => 
          col.key === columnKey ? { ...col, visible: false } : col
        );
        onColumnChange(newColumns);
        break;
      case 'pin':
        setPinnedColumns(prev => {
          const newSet = new Set(prev);
          newSet.add(columnKey);
          return newSet;
        });
        break;
      case 'unpin':
        setPinnedColumns(prev => {
          const newSet = new Set(prev);
          newSet.delete(columnKey);
          return newSet;
        });
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
        break;
      case 'duplicate':
        break;
      case 'delete':
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
    <div className="w-full">
      {/* Bulk Actions Toolbar */}
      {selectedRows.size > 0 && (
        <BulkActionsToolbar 
          selectedCount={selectedRows.size}
          onClearSelection={() => setSelectedRows(new Set())}
          onBulkAction={() => {}}
        />
      )}

      {/* Column Controls */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map((column) => (
              <DropdownMenuItem 
                key={column.key}
                onClick={() => {
                  const newColumns = columns.map(col => 
                    col.key === column.key ? { ...col, visible: !col.visible } : col
                  );
                  onColumnChange(newColumns);
                }}
              >
                <Checkbox checked={column.visible} className="mr-2" />
                {column.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterConfig(prev => ({ ...prev, status: ['new', 'qualified', 'proposal'] }))}>
              Active deals only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterConfig(prev => ({ ...prev, status: ['won'] }))}>
              Closed won only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterConfig(prev => ({ ...prev, status: [] }))}>
              Clear filter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={filteredAndSortedDeals.length > 0 && filteredAndSortedDeals.every(deal => selectedRows.has(deal.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(new Set(filteredAndSortedDeals.map(deal => deal.id)));
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-12"></TableHead>
              
              {visibleColumns.map((column) => (
                <ContextMenu key={column.key}>
                  <ContextMenuTrigger asChild>
                    <TableHead 
                      className={cn(
                        "relative  hover:bg-muted/50 transition-colors",
                        pinnedColumns.has(column.key) && "bg-primary/5 border-r border-primary/20"
                      )}
                      style={{ width: columnWidths[column.key] || column.width }}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {pinnedColumns.has(column.key) && (
                          <Pin className="h-3 w-3 text-primary" />
                        )}
                        <span>{column.title}</span>
                        {getSortIcon(column.key)}
                      </div>
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
                    {pinnedColumns.has(column.key) ? (
                      <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'unpin')}>
                        <PinOff className="h-4 w-4 mr-2" />
                        Unpin Column
                      </ContextMenuItem>
                    ) : (
                      <ContextMenuItem onClick={() => handleColumnContextMenu(column.key, 'pin')}>
                        <Pin className="h-4 w-4 mr-2" />
                        Pin Column
                      </ContextMenuItem>
                    )}
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
              
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedDeals.map((deal, rowIndex) => (
              <ContextMenu key={deal.id}>
                <ContextMenuTrigger asChild>
                  <React.Fragment>
                    <TableRow 
                      className={cn(
                        "group ",
                        selectedRows.has(deal.id) && "bg-muted/50",
                        focusedCell?.row === rowIndex && "ring-2 ring-primary",
                        favoriteDeals.has(deal.id) && "bg-yellow-50/50"
                      )}
                      onClick={(e) => toggleRowSelection(deal.id, e.ctrlKey || e.metaKey)}
                    >
                      {/* Selection */}
                      <TableCell className="sticky left-0 bg-background border-r">
                        <Checkbox
                          checked={selectedRows.has(deal.id)}
                          onCheckedChange={() => toggleRowSelection(deal.id)}
                        />
                      </TableCell>

                      {/* Expand */}
                      <TableCell onClick={() => toggleRowExpansion(deal.id)}>
                        {expandedRows.has(deal.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>

                      {/* Data Cells */}
                      {visibleColumns.map((column, colIndex) => (
                        <TableCell
                          key={column.key}
                          className={cn(
                            "relative",
                            focusedCell?.row === rowIndex && focusedCell?.col === colIndex && "ring-2 ring-primary"
                          )}
                          onClick={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                        >
                          {editingCell?.id === deal.id && editingCell?.field === column.key ? (
                            <Input
                              value={editingCell.value || ''}
                              onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(deal.id, column.key, editingCell.value);
                                }
                                if (e.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                              onBlur={() => handleCellEdit(deal.id, column.key, editingCell.value)}
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {column.key === 'status' ? (
                                getStatusBadge(deal.status)
                              ) : column.key === 'value' ? (
                                <span className="font-medium">{formatCurrency(deal.value)}</span>
                              ) : column.key === 'owner' ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
                                    {deal.owner.charAt(0)}
                                  </div>
                                  <span className="text-sm">{deal.owner}</span>
                                </div>
                              ) : column.key === 'expectedCloseDate' ? (
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
                              ) : column.key === 'probability' ? (
                                <span className="text-sm">{deal.probability}%</span>
                              ) : (
                                <span className="text-sm">{String(deal[column.key])}</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      ))}

                      {/* Actions */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'edit')}>
                      <Edit3 className="h-4 w-4 mr-2" />
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

                {/* Expanded Row Content */}
                {expandedRows.has(deal.id) && deal.activities && (
                  <>
                    {deal.activities.map((activity, index) => (
                      <TableRow key={`${deal.id}-activity-${index}`} className="bg-muted/30 border-l-4 border-l-primary/30">
                        <TableCell className="sticky left-0 bg-muted/30"></TableCell>
                        <TableCell className="pl-8"></TableCell>
                        <TableCell colSpan={visibleColumns.length}>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
                              {activity.user.charAt(0)}
                            </div>
                            <span>{activity.description}</span>
                            <Badge 
                              variant="outline" 
                              className={
                                activity.type === 'call' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                activity.type === 'email' ? 'bg-green-100 text-green-800 border-green-200' :
                                activity.type === 'meeting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }
                            >
                              {activity.type === 'call' ? 'Working on it' :
                               activity.type === 'email' ? 'Done' :
                               activity.type === 'meeting' ? 'Done' : 'Pending'}
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Add Activity Row */}
                    <TableRow className="bg-muted/20 border-l-4 border-l-primary/30">
                      <TableCell className="sticky left-0 bg-muted/20"></TableCell>
                      <TableCell className="pl-8">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell colSpan={visibleColumns.length}>
                        <Button variant="ghost" className="text-primary text-sm">
                          + Add subitem
                        </Button>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </>
                )}
              </React.Fragment>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem onClick={() => handleRowContextMenu(deal.id, 'edit')}>
                <Edit3 className="h-4 w-4 mr-2" />
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

            {/* Add Row */}
            <TableRow className="border-t-2">
              <TableCell className="sticky left-0 bg-background">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </TableCell>
              <TableCell></TableCell>
              <TableCell colSpan={visibleColumns.length}>
                <Button variant="ghost" className="text-primary">
                  + Add deal
                </Button>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Totals Bar - Pinned to Bottom */}
      <div className="sticky bottom-0 bg-background border-t border-border shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-8">
              <span className="text-muted-foreground">
                {totals.count} items
              </span>
              <span className="font-medium">
                Total: {formatCurrency(totals.totalValue)}
              </span>
              <span className="text-muted-foreground">
                Avg: {formatCurrency(totals.avgValue)}
              </span>
              <span className="text-muted-foreground">
                Avg Probability: {Math.round(totals.avgProbability)}%
              </span>
            </div>
            {selectedRows.size > 0 && (
              <span className="text-primary font-medium">
                {selectedRows.size} selected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}