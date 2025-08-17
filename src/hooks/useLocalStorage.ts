import { Deal, SortConfig, FilterConfig, ColumnConfig } from '@/types/deals';

interface UIState {
  sortConfigs: SortConfig[];
  filters: FilterConfig;
  columns: ColumnConfig[];
  selectedRows: string[];
  expandedRows: string[];
  searchQuery: string;
}

const STORAGE_KEYS = {
  SORT: 'deals-table-sort',
  FILTERS: 'deals-table-filters', 
  COLUMNS: 'deals-table-columns',
  SELECTED: 'deals-table-selected',
  EXPANDED: 'deals-table-expanded',
  SEARCH: 'deals-table-search',
} as const;

export const useLocalStorage = () => {
  const saveState = (state: Partial<UIState>) => {
    try {
      if (state.sortConfigs !== undefined) {
        localStorage.setItem(STORAGE_KEYS.SORT, JSON.stringify(state.sortConfigs));
      }
      if (state.filters !== undefined) {
        localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(state.filters));
      }
      if (state.columns !== undefined) {
        localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(state.columns));
      }
      if (state.searchQuery !== undefined) {
        localStorage.setItem(STORAGE_KEYS.SEARCH, state.searchQuery);
      }
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  };

  const loadState = (): Partial<UIState> => {
    try {
      const state: Partial<UIState> = {};
      
      const sortData = localStorage.getItem(STORAGE_KEYS.SORT);
      if (sortData) {
        state.sortConfigs = JSON.parse(sortData);
      }

      const filtersData = localStorage.getItem(STORAGE_KEYS.FILTERS);
      if (filtersData) {
        state.filters = JSON.parse(filtersData);
      }

      const columnsData = localStorage.getItem(STORAGE_KEYS.COLUMNS);
      if (columnsData) {
        state.columns = JSON.parse(columnsData);
      }

      const searchData = localStorage.getItem(STORAGE_KEYS.SEARCH);
      if (searchData) {
        state.searchQuery = searchData;
      }

      return state;
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
      return {};
    }
  };

  const clearState = () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  };

  return { saveState, loadState, clearState };
};