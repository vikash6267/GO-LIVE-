import { Table, TableBody } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { LocationTableHeader } from "./table/LocationTableHeader";
import { LocationTableRow } from "./table/LocationTableRow";
import { LocationTablePagination } from "./table/LocationTablePagination";
import { Location } from "./types/location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ArrowUpDown, Download } from "lucide-react";
import { useState } from "react";

interface LocationsTableProps {
  locations: Location[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function LocationsTable({ 
  locations,
  currentPage,
  totalPages,
  onPageChange,
}: LocationsTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleView = (locationId: number) => {
    toast({
      title: "Location Details",
      description: "Opening location details view...",
    });
  };

  const handleEdit = (locationId: number) => {
    toast({
      title: "Edit Location",
      description: "Opening location editor...",
    });
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Address", "Status", "Manager", "Orders This Month", "Last Active"].join(","),
      ...filteredLocations.map(location => [
        location.name,
        location.address,
        location.status,
        location.manager,
        location.ordersThisMonth,
        location.lastActive
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'locations.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Location data has been exported to CSV",
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc");
  };

  const filteredLocations = locations
    .filter(location => 
      (location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || location.status === filterStatus)
    )
    .sort((a, b) => {
      const modifier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "name") return modifier * a.name.localeCompare(b.name);
      if (sortBy === "status") return modifier * a.status.localeCompare(b.status);
      if (sortBy === "lastActive") {
        return modifier * (new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
      }
      if (sortBy === "ordersThisMonth") {
        return modifier * ((a.ordersThisMonth || 0) - (b.ordersThisMonth || 0));
      }
      return 0;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="lastActive">Last Active</SelectItem>
              <SelectItem value="ordersThisMonth">Orders</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="px-3"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <LocationTableHeader />
            <TableBody>
              {filteredLocations.map((location) => (
                <LocationTableRow
                  key={location.id}
                  location={location}
                  onView={handleView}
                  onEdit={handleEdit}
                  getStatusColor={getStatusColor}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <LocationTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}