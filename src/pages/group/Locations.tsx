import { DashboardLayout } from "@/components/DashboardLayout";
import { LocationMap } from "@/components/group/LocationMap";
import { LocationsTable } from "@/components/group/LocationsTable";
import { useEffect, useState } from "react";
import { Location } from "@/components/group/types/location";
import { supabase } from "@/integrations/supabase/client";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/selectors/userSelectors";
import { fetchCustomerLocation } from "./Dashboard";

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
  const userProfile = useSelector(selectUserProfile);
  
  const [dbLocations,setDbLocations] = useState([])
  
  const totalPages = Math.ceil(dbLocations.length / 10);

 
  
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
  
  return (
    <DashboardLayout role="group">
      <div className="space-y-6">
        <LocationMap locations={dbLocations} />
        <LocationsTable
          locations={dbLocations}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          fetchLocations={fetchLocations}
        />
      </div>
    </DashboardLayout>
  );
}