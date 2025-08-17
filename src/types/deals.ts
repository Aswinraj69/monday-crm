export type DealStatus = 'new' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Deal {
  id: string;
  dealName: string;
  company: string;
  owner: string;
  status: DealStatus;
  value: number;
  expectedCloseDate: string;
  probability: number;
  lastActivity: string;
  source: string;
  notes?: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  date: string;
  user: string;
}

export interface SortConfig {
  key: keyof Deal;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  status?: DealStatus[];
  owner?: string[];
  valueMin?: number;
  valueMax?: number;
  search?: string;
}

export interface ColumnConfig {
  key: keyof Deal;
  title: string;
  width: number;
  visible: boolean;
  sortable: boolean;
  resizable: boolean;
}

export type GroupByField = 'status' | 'owner' | 'company' | 'source' | 'none';

export interface DealGroup {
  name: string;
  key: string;
  deals: Deal[];
  total: number;
  totalValue: number;
  color: string;
  bgColor: string;
  expanded: boolean;
}