import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { CreateOrderForm } from "@/components/orders/CreateOrderForm";
import { useEffect, useState } from "react";
import { OrderFormValues } from "@/components/orders/schemas/orderSchema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/selectors/userSelectors";
import { fetchCustomerLocation } from "./Dashboard";
import { supabase } from "@/integrations/supabase/client";
import ProductShowcase from "@/components/pharmacy/ProductShowcase";

export default function GroupOrder() {
  const [orderData, setOrderData] = useState<Partial<OrderFormValues>>({});
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const userProfile = useSelector(selectUserProfile);
  const [dbLocations,setDbLocations] = useState([])



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


  // Get group info from session storage
  const groupInfo = {
    name: sessionStorage.getItem("groupName") || "",
    id: sessionStorage.getItem("groupId") || "",
    pharmacies: dbLocations
  };

  // Simulate loading state
  useState(() => {
    const timer = setTimeout(() => {
      if (!groupInfo.name) {
       
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  });

  const handlePharmacyChange = async (pharmacyId: string) => {
    setSelectedPharmacy(pharmacyId);
    setOrderData({})
  console.log("pharmacyId",pharmacyId)
    const selectedPharmacyData = groupInfo.pharmacies.find(
      (p) => p.id === pharmacyId
    );
  
    sessionStorage.setItem("groupId" ,pharmacyId )
    if (!selectedPharmacyData) {
      console.error("Pharmacy not found for ID:", pharmacyId);
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("id", selectedPharmacyData.id)
        .maybeSingle();
  
      if (error) {
        console.error("Database Error - Failed to fetch profile:", error);
        throw new Error(`Database error: ${error.message}`);
      }
  
      if (!data) {
        console.error("User profile not found for ID:", selectedPharmacyData.id);
        return;
      }
  
      console.log("Successfully fetched profile:", data);
  

      setOrderData((prevState) => ({
 
        customerInfo: {
          cusid:data.id || "test",
          type: "Pharmacy",
          name: data.name,
          email: data.contact_email || "",
          phone: data.contact_phone || "",
          address: {
            street: `${data.address.street1}, ${data.address.street2}` || "",
            city: data.address.city || "",
            state: data.address.state || "",
            zip_code: data.address.zip_code || "",
          },
        },
      }));
      console.log(orderData)
    } catch (err) {
      console.error("Error in handlePharmacyChange:", err);
    }
  };
  
  // ✅ UseEffect to log updated orderData
  useEffect(() => {
    console.log("Updated order data:", orderData);
  }, [orderData]); // Jab bhi orderData update hoga, tab yeh effect chalega
  


  const handleFormChange = (data: Partial<OrderFormValues>) => {
    setOrderData(data);
  };

  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <DashboardLayout role="group">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="group">
      <div className="space-y-6 p-6 bg-white rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Group Order
            </h1>
            <p className="text-muted-foreground">
              {groupInfo.name
                ? `Place a new order for ${groupInfo.name}`
                : "Place a new order"}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className=" flex items-center">
          <div className="mb-6">
            <Label htmlFor="pharmacy-select">Select Pharmacy</Label>
            <Select
              value={selectedPharmacy}
              onValueChange={handlePharmacyChange}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a pharmacy" />
              </SelectTrigger>
              <SelectContent>
                {groupInfo.pharmacies.map((pharmacy) => (
                  <SelectItem key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name} - {pharmacy.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

             {/* Button to Open Popup */}
      

          </div>
          <div>
          <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Show Products
      </button>
          </div>
          </div>


     

      {/* Popup Modal */}
      {isOpen && (
  <div className="">
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 h-screen z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[50%] relative h-[80vh] overflow-y-scroll">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg"
            >
              ✖
            </button>

            {/* Modal Content */}
            
            <ProductShowcase groupShow={true} />
          </div>
        </div>
    </div>
      )}
        
          {orderData.customerInfo  && selectedPharmacy &&   (
            <CreateOrderForm
              initialData={orderData}
              onFormChange={handleFormChange}
              locationId={selectedPharmacy}
              use="group"
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
