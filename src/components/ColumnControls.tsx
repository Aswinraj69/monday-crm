import React, { useState } from 'react';
import { Settings, Eye, EyeOff, GripVertical, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnConfig } from '@/types/deals';

interface ColumnControlsProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

interface SortableColumnItemProps {
  column: ColumnConfig;
  onToggle: (key: string) => void;
  onPinToggle: (key: string) => void;
}

function SortableColumnItem({ column, onToggle, onPinToggle }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className=" active:bing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Checkbox
        checked={column.visible}
        onCheckedChange={() => onToggle(column.key)}
        className="data-[state=checked]:bg-primary"
      />
      
      <div className="flex items-center gap-2 flex-1">
        {column.visible ? (
          <Eye className="h-4 w-4 text-muted-foreground" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{column.title}</span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-muted/50"
        onClick={() => onPinToggle(column.key)}
        title={column.pinned ? 'Unpin column' : 'Pin column'}
      >
        {column.pinned ? (
          <Pin className="h-3 w-3 text-primary" />
        ) : (
          <PinOff className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export function ColumnControls({ columns, onColumnsChange }: ColumnControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex((column) => column.key === active.id);
      const newIndex = columns.findIndex((column) => column.key === over?.id);
      
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      onColumnsChange(newColumns);
    }
  };

  const toggleColumn = (columnKey: string) => {
    const newColumns = columns.map(col => 
      col.key === columnKey 
        ? { ...col, visible: !col.visible }
        : col
    );
    onColumnsChange(newColumns);
  };

  const togglePinColumn = (columnKey: string) => {
    const newColumns = columns.map(col => 
      col.key === columnKey 
        ? { ...col, pinned: !col.pinned }
        : col
    );
    onColumnsChange(newColumns);
  };

  const visibleCount = columns.filter(col => col.visible).length;
  const pinnedCount = columns.filter(col => col.pinned).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background border shadow-sm">
          <Settings className="h-4 w-4" />
          Columns ({visibleCount})
          {pinnedCount > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded px-1">
              {pinnedCount} pinned
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 p-0 bg-background border shadow-lg z-50"
        align="end"
      >
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Column Settings</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Drag to reorder, toggle to show/hide, pin to freeze
          </p>
        </div>
        
        <div className="p-2 max-h-80 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={columns.map(col => col.key)}
              strategy={verticalListSortingStrategy}
            >
              {columns.map((column) => (
                <SortableColumnItem
                  key={column.key}
                  column={column}
                  onToggle={toggleColumn}
                  onPinToggle={togglePinColumn}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        
        <div className="p-3 border-t bg-muted/20">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const allVisible = columns.map(col => ({ ...col, visible: true }));
                onColumnsChange(allVisible);
              }}
              className="text-xs"
            >
              Show All
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const defaultVisible = columns.map(col => ({ 
                  ...col, 
                  visible: ['dealName', 'status', 'owner', 'value'].includes(col.key)
                }));
                onColumnsChange(defaultVisible);
              }}
              className="text-xs"
            >
              Reset
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const unpinned = columns.map(col => ({ ...col, pinned: false }));
                onColumnsChange(unpinned);
              }}
              className="text-xs"
            >
              Unpin All
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}