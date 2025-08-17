# DealsTable Interactions Documentation

## Implemented Interactions

### Keyboard Navigation
- **Arrow Keys**: Navigate between cells (Up/Down/Left/Right)
- **Enter**: Enter/exit edit mode for editable cells
- **Escape**: Cancel edit mode or clear focus

### Mouse Interactions
- **Click**: Select single row, focus cell
- **Ctrl/Cmd + Click**: Multi-select rows
- **Shift + Click**: Range selection of rows
- **Header Click**: Sort by column (ascending → descending → clear)
- **Shift + Header Click**: Multi-column sorting

### Inline Editing
- **Editable Fields**: dealName, company, owner, value, probability, source
- **Edit Trigger**: Enter key or double-click on focused cell
- **Save**: Enter key or blur (click outside)
- **Cancel**: Escape key

### Row Operations
- **Select All**: Checkbox in header
- **Row Selection**: Individual checkboxes or row clicks
- **Row Expansion**: Chevron button shows notes and activities
- **Context Menu**: Right-click on rows for actions (Edit, Duplicate, Delete)

### Column Operations
- **Sorting**: Single and multi-column sorting with visual indicators
- **Resizing**: Drag column borders to resize (100px - 400px range)
- **Context Menu**: Right-click headers for sort options

### Filtering & Search
- **Status Filter**: Dropdown to filter by deal status
- **Owner Filter**: Dropdown to filter by deal owner
- **Value Range**: Min/max value filters

### Bulk Actions
- **Selection Tools**: Clear selection, bulk operations toolbar
- **Multi-select**: Ctrl+click and shift+click support


### Right click of column
- ** To pin  and unpin
## Known Issues

1. **Edit Persistence**: Cell edits are logged but not persisted to data (placeholder implementation)
2. **Context Menu Actions**: Menu items are placeholders without actual functionality
3. **Bulk Actions**: Toolbar appears but actions need implementation
4. **Column Hiding**: Context menu option exists but not implemented
5. **Touch Support**: No specific touch/mobile optimizations for interactions
6. **Accessibility**: Limited ARIA labels and screen reader support
7. **Undo/Redo**: No undo functionality for edits
8. **Validation**: No input validation during inline editing

## Performance Notes
- Keyboard navigation works smoothly with up to ~1000 rows
- Multi-sorting may impact performance with very large datasets
- Row expansion renders all activities immediately (no pagination)