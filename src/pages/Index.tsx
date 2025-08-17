import { useState, useMemo } from 'react';
import { DealsPageHeader } from '@/components/DealsPageHeader';
import { GroupedDealsTable } from '@/components/GroupedDealsTable';
import { mockDeals } from '@/data/mockDeals';
import { Deal, DealStatus, GroupByField } from '@/types/deals';

interface FilterState {
  status?: DealStatus[];
  owner?: string[];
  search?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('main-table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [groupByField, setGroupByField] = useState<GroupByField | null>(null);

  const filteredDeals = useMemo(() => {
    let filtered = mockDeals;

    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.dealName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(deal => filters.status.includes(deal.status));
    }

    return filtered;
  }, [searchTerm, filters]);

  return (
    <div className="h-screen bg-background flex flex-col">
      <DealsPageHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        groupByField={groupByField}
        onGroupByChange={setGroupByField}
      />
      <div className="flex-1 overflow-hidden">
        {activeTab === 'main-table' && (
          <div className="h-full flex flex-col">
            <GroupedDealsTable deals={filteredDeals} groupByField={groupByField} />
          </div>
        )}
        {activeTab === 'sales-report' && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sales Report View (Coming Soon)
          </div>
        )}
        {activeTab === 'pipeline' && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Pipeline View (Coming Soon)
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
