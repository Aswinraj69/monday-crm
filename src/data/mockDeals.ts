import { Deal, Activity, ColumnConfig } from '@/types/deals';

const activities: Activity[] = [
  {
    id: '1',
    type: 'call',
    description: 'Follow up call with decision maker',
    date: '2024-01-22',
    user: 'Steven Scott'
  },
  {
    id: '2',
    type: 'email',
    description: 'Send proposal draft',
    date: '2024-01-20',
    user: 'Sam Jones'
  },
  {
    id: '3',
    type: 'meeting',
    description: 'Demo meeting scheduled',
    date: '2024-01-18',
    user: 'Robert Thompson'
  },
  {
    id: '4',
    type: 'call',
    description: 'Discovery call completed',
    date: '2024-01-15',
    user: 'Steven Scott'
  },
  {
    id: '5',
    type: 'email',
    description: 'Requirements gathering',
    date: '2024-01-12',
    user: 'Sam Jones'
  },
  {
    id: '6',
    type: 'meeting',
    description: 'Initial consultation',
    date: '2024-01-10',
    user: 'Robert Thompson'
  }
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    dealName: 'Google',
    company: 'Google',
    owner: 'Steven Scott',
    status: 'qualified',
    value: 70000,
    expectedCloseDate: '2024-10-12',
    probability: 75,
    lastActivity: '2024-01-20',
    source: 'Website',
    notes: 'Strong interest in our enterprise package',
    activities: activities.slice(0, 3)
  },
  {
    id: '2',
    dealName: 'Apple deal',
    company: 'Apple',
    owner: 'Sam Jones',
    status: 'proposal',
    value: 55000,
    expectedCloseDate: '2024-11-09',
    probability: 60,
    lastActivity: '2024-01-19',
    source: 'Referral',
    activities: activities.slice(1, 4)
  },
  {
    id: '3',
    dealName: 'Amazon deal',
    company: 'Amazon',
    owner: 'Robert Thompson',
    status: 'proposal',
    value: 100000,
    expectedCloseDate: '2024-08-22',
    probability: 100,
    lastActivity: '2024-01-18',
    source: 'Cold Call',
    activities: activities
  },
  {
    id: '4',
    dealName: 'Amazon deal',
    company: 'Amazon',
    owner: 'Robert Thompson',
    status: 'won',
    value: 55000,
    expectedCloseDate: '2024-10-11',
    probability: 25,
    lastActivity: '2024-01-17',
    source: 'LinkedIn',
    activities: activities.slice(0, 2)
  },
  {
    id: '5',
    dealName: 'Apple deal',
    company: 'Apple',
    owner: 'kian jack',
    status: 'won',
    value: 30000,
    expectedCloseDate: '2024-08-16',
    probability: 80,
    lastActivity: '2024-01-21',
    source: 'Trade Show',
    activities: activities.slice(2, 5)
  }
];

export const defaultColumns: ColumnConfig[] = [
  { key: 'dealName', title: 'Deal Name', width: 200, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'company', title: 'Company', width: 150, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'owner', title: 'Owner', width: 120, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'status', title: 'Status', width: 100, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'value', title: 'Value', width: 120, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'probability', title: 'Probability', width: 100, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'expectedCloseDate', title: 'Close Date', width: 120, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'lastActivity', title: 'Last Activity', width: 120, visible: true, sortable: true, resizable: true, pinned: false },
  { key: 'source', title: 'Source', width: 120, visible: true, sortable: true, resizable: true, pinned: false }
];