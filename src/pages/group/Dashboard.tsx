import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LocationsTable } from "@/components/group/LocationsTable";
import { AddPharmacyModal } from "@/components/group/AddPharmacyModal";
import { Location } from "@/components/group/types/location";
import { EnhancedStatsCard } from "@/components/dashboard/EnhancedStatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Building2, TrendingUp, DollarSign, Users } from "lucide-react";
import { LocationMap } from "@/components/group/LocationMap";

const GroupDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPharmacyOpen, setIsAddPharmacyOpen] = useState(false);
  const itemsPerPage = 8;

  // Create serializable location data
  const locations: Location[] = Array.from({ length: 40 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 10));

    return {
      id: i + 1,
      name: `Pharmacy Location ${i + 1}`,
      address: `${1000 + i} Main Street, City ${i + 1}`,
      status: i % 2 === 0 ? "active" : "inactive",
      ordersThisMonth: Math.floor(Math.random() * 100),
      lastActive: date.toISOString(),
      manager: `Manager ${i + 1}`,
    };
  });

  const handlePharmacyAdded = () => {
    // console.log("Pharmacy added successfully");
  };

  // Define serializable stats without React elements
  const stats = [
    {
      title: "Total Locations",
      value: String(locations.length),
      iconType: "building",
      change: "+2",
      trend: "up" as const,
      description: "from last month",
      tooltip: "Number of active pharmacy locations",
    },
    {
      title: "Total Staff",
      value: "156",
      iconType: "users",
      change: "+12",
      trend: "up" as const,
      description: "new members",
      tooltip: "Total staff members across all locations",
    },
    {
      title: "Monthly Revenue",
      value: "$234,567",
      iconType: "dollar",
      change: "+8.2%",
      trend: "up" as const,
      description: "vs last month",
      tooltip: "Combined revenue from all locations",
    },
    {
      title: "Growth Rate",
      value: "12.5%",
      iconType: "trending",
      change: "+2.4%",
      trend: "up" as const,
      description: "vs last quarter",
      tooltip: "Overall business growth rate",
    },
  ];

  // Function to get icon component based on type
  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "building":
        return <Building2 className="h-4 w-4 text-muted-foreground" />;
      case "users":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case "dollar":
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout role="group">
      <div className="space-y-8 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Group Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy locations and monitor performance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <EnhancedStatsCard
              key={index}
              {...stat}
              icon={getIconComponent(stat.iconType)}
            />
          ))}
        </div>

        <div className="grid gap-6 ">
          {/* <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Location Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationMap locations={locations} />
            </CardContent>
          </Card> */}

          <div className="">
            <QuickActions />
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationsTable
              locations={locations}
              currentPage={currentPage}
              totalPages={Math.ceil(locations.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>

      <AddPharmacyModal
        open={isAddPharmacyOpen}
        onOpenChange={setIsAddPharmacyOpen}
        onPharmacyAdded={handlePharmacyAdded}
      />
    </DashboardLayout>
  );
};

export default GroupDashboard;
