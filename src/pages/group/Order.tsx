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
            address:location.address         
            ,
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
        toast({
          title: "Missing Group Information",
          description:
            "Please ensure you're logged in with a valid group account.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  });

  const handlePharmacyChange = (pharmacyId: string) => {
    setSelectedPharmacy(pharmacyId);
    const selectedPharmacyData = groupInfo.pharmacies.find(
      (p) => p.id === pharmacyId
    );

    if (selectedPharmacyData) {
      setOrderData({
        customerInfo: {
          type: "Pharmacy",
          name: selectedPharmacyData.name,
          email: selectedPharmacyData.contact_email || "",
          phone: selectedPharmacyData.contact_phone|| "",
          address: {
            street: selectedPharmacyData.address.street1 || "",
            city: selectedPharmacyData.address.city,
            state: selectedPharmacyData.address.state || "",
            zip_code: selectedPharmacyData.address.zip_code || "",
          },
        },
      });
    }
  };

  useEffect(() => {
    if (selectedPharmacy) {
      const selectedPharmacyData = groupInfo.pharmacies.find(
        (p) => p.id === selectedPharmacy
      );
  
      if (selectedPharmacyData) {
        setOrderData({
          customerInfo: {
            type: "Pharmacy",
            name: selectedPharmacyData.name,
            email: selectedPharmacyData.contact_email || "",
            phone: selectedPharmacyData.contact_phone || "",
            address: {
              street: selectedPharmacyData.address.street1 || "",
              city: selectedPharmacyData.address.city,
              state: selectedPharmacyData.address.state || "",
              zip_code: selectedPharmacyData.address.zip_code || "",
            },
          },
        });
      }
    }
  }, [selectedPharmacy]); // Jab bhi pharmacy change ho, orderData update ho
  

  const handleFormChange = (data: Partial<OrderFormValues>) => {
    setOrderData(data);
  };

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
          </div>

          {selectedPharmacy && (
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
