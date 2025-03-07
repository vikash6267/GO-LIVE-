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

 
  

  useEffect(() => {
    const fetchLocations = async () => {
      if (!userProfile?.id) return; // Agar ID nahi hai to return kar do
    
      try {
        const res = await fetchCustomerLocation(userProfile?.id);
        if (!res) return;
    
        // Map ko async function banana padega
        const formatLocations = async (data) => {
          return Promise.all(data.map(async (location, index) => {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
            const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
    
            // ✅ Supabase se orders count fetch karo
            const { count, error } = await supabase
              .from("orders")
              .select("*", { count: "exact", head: true })
              .eq("profile_id", location.id)
              .gte("created_at", startOfMonth)
              .lte("created_at", endOfMonth);
    
            if (error) {
              console.error("Error fetching count:", error);
            }
    
            return {
              id: location.id || index + 1,
              name: location.display_name?.trim() ? location.display_name : `Location ${index + 1}`,
              address: `${location.billing_address?.street1?.trim() ? location.billing_address.street1 : "N/A"}, 
                        ${location.billing_address?.city?.trim() ? location.billing_address.city : "N/A"} 
                        ${location.billing_address?.zip_code?.trim() ? location.billing_address.zip_code : "N/A"}`,
              countryRegion: location.countryRegion || "N/A",
              phone: location.phone || "N/A",
              faxNumber: location.faxNumber || "N/A",
              contact_email: location.email || "N/A",
              contact_phone: location.mobile_phone || "N/A",
              created_at: location.created_at ? new Date(location.created_at).toISOString() : "N/A",
              updated_at: location.updated_at ? new Date(location.updated_at).toISOString() : "N/A",
              profile_id: location.profile_id || "N/A",
              type: location.type || "N/A",
              status: location.status || "pending",
              manager: location?.locations?.find(item => item.manager)?.manager || "N/A",
              ordersThisMonth: count || 0 // Agar count undefined ho to 0 set karna
            };
          }));
        };
    
        const formattedLocations = await formatLocations(res);
        console.log("Formatted Locations:", formattedLocations);
    
        setDbLocations(formattedLocations);
        console.log("User Profile:", userProfile);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
  
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
        />
      </div>
    </DashboardLayout>
  );
}