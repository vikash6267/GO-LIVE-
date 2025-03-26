import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CSVLink } from "react-csv";

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
  exportInvoicesToCSV?: () => void; // Expecting an array of CSV data

}

export function InvoiceFilters({ onFilterChange,exportInvoicesToCSV }: InvoiceFiltersProps) {
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
    <div className="space-y-4 ">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Input
          type="text"
          placeholder="Search invoice Number"
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
            <SelectItem value="unpaid">Pending</SelectItem>
            {/* <SelectItem value="overdue">Overdue</SelectItem> */}
          </SelectContent>
        </Select>


<div className=" flex items-center justify-center"> <CSVLink
        data={exportInvoicesToCSV()}
        filename={`invoices_${new Date().toISOString()}.csv`}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md transition-all hover:bg-blue-700 hover:scale-105"
      >
        Export CSV
      </CSVLink></div>
      </div>

   
    </div>
  );
}