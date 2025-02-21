import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface FilterValues {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

interface InvoiceFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export function InvoiceFilters({ onFilterChange }: InvoiceFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({});

  const handleFilterChange = (key: keyof FilterValues, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Input
          type="text"
          placeholder="Search invoices..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="lg:col-span-2"
        />

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="From Date"
          value={filters.dateFrom || ''}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />

        <Input
          type="date"
          placeholder="To Date"
          value={filters.dateTo || ''}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        />

        <Input
          type="number"
          placeholder="Min Amount"
          value={filters.amountMin || ''}
          onChange={(e) => handleFilterChange('amountMin', e.target.value ? Number(e.target.value) : undefined)}
        />

        <Input
          type="number"
          placeholder="Max Amount"
          value={filters.amountMax || ''}
          onChange={(e) => handleFilterChange('amountMax', e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      <Button variant="outline" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}