import { DashboardLayout } from "@/components/DashboardLayout";
import { LocationMap } from "@/components/group/LocationMap";
import { LocationsTable } from "@/components/group/LocationsTable";
import { useState } from "react";
import { Location } from "@/components/group/types/location";

// Sample data for demonstration
const sampleLocations: Location[] = [
  {
    id: 1,
    name: "Main Branch",
    address: "123 Healthcare Ave, Medical District",
    status: "active",
    manager: "John Smith",
    ordersThisMonth: 145,
    lastActive: "2024-01-07",
    phone: "(555) 123-4567",
    email: "mainbranch@healthcare.com"
  },
  {
    id: 2,
    name: "West Side Clinic",
    address: "456 Wellness Blvd, West Side",
    status: "active",
    manager: "Sarah Johnson",
    ordersThisMonth: 89,
    lastActive: "2024-01-06",
    phone: "(555) 234-5678",
    email: "westside@healthcare.com"
  }
];

export default function Locations() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sampleLocations.length / 10);

  return (
    <DashboardLayout role="group">
      <div className="space-y-6">
        <LocationMap locations={sampleLocations} />
        <LocationsTable
          locations={sampleLocations}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}