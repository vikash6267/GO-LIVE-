import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { CreateOrderForm } from "@/components/orders/CreateOrderForm";
import { useState } from "react";
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

export default function GroupOrder() {
  const [orderData, setOrderData] = useState<Partial<OrderFormValues>>({});
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Get group info from session storage
  const groupInfo = {
    name: sessionStorage.getItem("groupName") || "",
    id: sessionStorage.getItem("groupId") || "",
    pharmacies: [
      { id: "1", name: "Pharmacy A", location: "New York" },
      { id: "2", name: "Pharmacy B", location: "Los Angeles" },
      { id: "3", name: "Pharmacy C", location: "Chicago" },
    ], // This would typically come from an API
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
          email: sessionStorage.getItem("userEmail") || "",
          phone: sessionStorage.getItem("userPhone") || "",
          address: {
            street: sessionStorage.getItem("pharmacyStreet") || "",
            city: selectedPharmacyData.location,
            state: sessionStorage.getItem("pharmacyState") || "",
            zip_code: sessionStorage.getItem("pharmacyzip_code") || "",
          },
        },
      });
    }
  };

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
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
