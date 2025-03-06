import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LocationsTable } from "@/components/group/LocationsTable";
import { AddPharmacyModal } from "@/components/group/AddPharmacyModal";
import { Location } from "@/components/group/types/location";
import { EnhancedStatsCard } from "@/components/dashboard/EnhancedStatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Building2, TrendingUp, DollarSign, Users } from "lucide-react";
import { LocationMap } from "@/components/group/LocationMap";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/selectors/userSelectors";
import { supabase } from "@/integrations/supabase/client";

const GroupDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPharmacyOpen, setIsAddPharmacyOpen] = useState(false);
  const itemsPerPage = 8;
  const userProfile = useSelector(selectUserProfile);

  const [dbLocations,setDbLocations] = useState([])

  const handlePharmacyAdded = () => {
    // console.log("Pharmacy added successfully");
  };

  // Define serializable stats without React elements
  const stats = [
    {
      title: "Total Locations",
      value: String(dbLocations.length),
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



  const fetchCustomerLocation = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("profile_id", userId);
  
      if (error) {
        console.error("Failed to fetch customer information:", error);
        throw new Error("Failed to fetch customer information: " + error.message);
      }
  
      if (!data || data.length === 0) {
        throw new Error("No customer information found.");
      }
  
      console.log("Fetched Data:", data);
  
      return data; // ✅ FIXED: Ab locations ki jagah data return ho raha hai
    } catch (error) {
      console.error("Error fetching customer info:", error);
      return null;
    }
  };
  

  const fetchLocations = async () => {
    if (!userProfile?.id) return; // Agar ID nahi hai to return kar do
    try {
      const res = await fetchCustomerLocation(userProfile.id);
      if (!res) return;

      const formatLocations = (data) => {
        return data.map((location, index) => ({
          id: location.id || index + 1,
          name: location.name?.trim() ? location.name : `Location ${index + 1}`, // Agar name undefined ya empty ho to default set karega
          address: `${
            location.address?.street1?.trim() ? location.address.street1 : "N/A"
          }, ${
            location.address?.city?.trim() ? location.address.city : "N/A"
          } ${
            location.address?.zip_code?.trim() ? location.address.zip_code : "N/A"
          }`
          
          ,
          countryRegion: location.countryRegion || "N/A",
          phone: location.phone || "N/A",
          faxNumber: location.faxNumber || "N/A",
          contact_email: location.contact_email || "N/A",
          contact_phone: location.contact_phone || "N/A",
          created_at: location.created_at ? new Date(location.created_at).toISOString() : "N/A",
          updated_at: location.updated_at ? new Date(location.updated_at).toISOString() : "N/A",
          profile_id: location.profile_id || "N/A",
          type: location.type || "N/A",
          status: location.status || "pending",
          manager: location.manager || "N/A",
          ordersThisMonth: Math.floor(Math.random() * 100), // Dummy data
        }));
      };
      
      

      const formattedLocations = formatLocations(res);
      console.log("Formatted Locations:", formattedLocations);

      setDbLocations(formattedLocations);
      console.log("User Profile:", userProfile);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };


  useEffect(() => {
  
  
    fetchLocations();
  }, [userProfile]);
  

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
              locations={dbLocations}
              currentPage={currentPage}
              fetchLocations={fetchLocations}
              totalPages={Math.ceil(dbLocations.length / itemsPerPage)}
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
