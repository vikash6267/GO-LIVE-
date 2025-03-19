import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersList } from "./table/OrdersList";
import { StatusFilter } from "./table/StatusFilter";
import { OrderDetailsSheet } from "./table/OrderDetailsSheet";
import { OrderFilters } from "./table/OrderFilters";
import { useOrderFilters } from "./hooks/useOrderFilters";
import { useOrderManagement } from "./hooks/useOrderManagement";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateOrderForm } from "./CreateOrderForm";
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { generateOrderId } from "./utils/orderUtils";
import ProductShowcase from "../pharmacy/ProductShowcase";
import { useLocation, useNavigate } from "react-router-dom";
import { OrderFormValues } from "./schemas/orderSchema";
import {

  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Select from "react-select";

interface OrdersContainerProps {
  userRole?: "admin" | "pharmacy" | "group" | "hospital";
  onProcessOrder?: (orderId: string) => void;
  onShipOrder?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => Promise<void>;
}

export const OrdersContainer = ({
  userRole = "pharmacy",
  onProcessOrder,
  onShipOrder,
  onConfirmOrder,
  onDeleteOrder,
}: OrdersContainerProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();


  const navigate = useNavigate();

  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState<boolean>(!!location.state?.createOrder);

  const [orderData, setOrderData] = useState<Partial<OrderFormValues>>({});
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [userData, setUserData] = useState<any[]>([]);
  const [options, setOptions] = useState([])

  const {
    orders,
    selectedOrder,
    selectedOrders,
    isEditing,
    isSheetOpen,
    setSelectedOrders,
    setIsEditing,
    setIsSheetOpen,
    handleOrderClick,
    handleProcessOrder: processOrder,
    handleShipOrder: shipOrder,
    handleConfirmOrder: confirmOrder,
  } = useOrderManagement();


  useEffect(() => {
    // setIsCreateOrderOpen(location.state?.createOrder) 
    if (location.state?.createOrder) {
      setIsCreateOrderOpen(true);

      // 🔹 Location state ko reset karne ke liye navigate ka istemal karein
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  console.log(orders);
  const {
    statusFilter,
    searchQuery,
    dateRange,
    setStatusFilter,
    setSearchQuery,
    setDateRange,
    filteredOrders,
  } = useOrderFilters(orders);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast({
            title: "Error",
            description: "Please log in to view orders",
            variant: "destructive",
          });
          return;
        }

        const { data: orders, error } = await supabase
          .from("orders")
          .select("*")
          .eq("profile_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("First few orders:", orders?.slice(0, 3));
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
      }
    };

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, type");

        if (error) {
          console.error("Failed to fetch customer information:", error);
          throw new Error(`Failed to fetch customer information: ${error.message}`);
        }

        console.log("Fetched pharmacies:", data);
        setUserData(data);

        // Custom ko sabse upar laane ke liye sort karein
        const sortedOptions = data
          .map((pharmacy) => ({
            value: pharmacy.id,
            label: pharmacy.type === "admin" ? "Custom" : pharmacy.display_name,
            isCustom: pharmacy.type === "admin" ? 0 : 1, // Custom ko 0 aur baki ko 1
          }))
          .sort((a, b) => a.isCustom - b.isCustom); // Sort logic: Custom sabse upar

        setOptions(sortedOptions);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };



    fetchUsers();
    fetchOrders();
  }, []); // Ensure dependencies are correctly placed if needed


  const handlePharmacyChange = async (pharmacyId: string) => {
    setSelectedPharmacy(pharmacyId);
    setOrderData(null)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", pharmacyId) // Use pharmacyId, not selectedPharmacy
        .maybeSingle();

      if (error) {
        console.error("Database Error - Failed to fetch profile:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.error("User profile not found for ID:", pharmacyId);
        return;
      }

      console.log("Successfully fetched profile:", data);

      sessionStorage.setItem("taxper", data.taxPercantage);

      setOrderData((prevState) => ({
        ...prevState,
        customerInfo: {
          cusid: data.id || "test",
          type: "Pharmacy",
          name: data.display_name,
          email: data.email || "",
          phone: data.mobile_phone || "",
          address: {
            street: `${data.billing_address?.street1 || ""}`,
            city: data.billing_address?.city || "",
            state: data.billing_address?.state || "",
            zip_code: data.billing_address?.zip_code || "",
          },
        },
      }));

      console.log("Updated Order Data:", orderData);
    } catch (err) {
      console.error("Error in handlePharmacyChange:", err);
    }
  };


  const handleFormChange = (data: Partial<OrderFormValues>) => {
    setOrderData(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <OrderFilters
          onSearch={setSearchQuery}
          onDateChange={setDateRange}
          onExport={() => console.log("Export functionality to be implemented")}
        />
        {userRole === "admin" && (
          <div className=" flex flex-wrap">
            <Sheet open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
              <SheetTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[90vw] sm:max-w-[640px] overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle>Create New Order</SheetTitle>
                </SheetHeader>


                <div className="mb-6">
                  <Label htmlFor="pharmacy-select">Select Pharmacy</Label>
                  <Select
                    id="pharmacy-select"
                    options={options}
                    value={options.find((option) => option.value === selectedPharmacy)}
                    onChange={(selectedOption) => handlePharmacyChange(selectedOption.value)}
                    placeholder="Search pharmacy..."
                    isSearchable
                    className="w-full md:w-[300px]"
                  />
                </div>
                {orderData?.customerInfo && <div className="mt-4">
                  <CreateOrderForm

                    isEditing={false}
                    initialData={orderData}
                    onFormChange={handleFormChange}
                

                  />
                </div>}
              </SheetContent>
            </Sheet>

            {/* Move the Show Products button outside of SheetTrigger */}
            <button
              onClick={() => setIsOpen(true)}
              className="bg-blue-600 text-white px-4 lg:mt-0 mt-3 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Products All
            </button>
          </div>
        )}

      </div>



      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed -inset-4 flex items-center justify-center bg-black bg-opacity-50 h-screen z-[50]">
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
      )}

      <StatusFilter value={statusFilter} onValueChange={setStatusFilter} />

      <OrdersList
        orders={filteredOrders}
        onOrderClick={handleOrderClick}
        selectedOrder={selectedOrder}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        userRole={userRole}
        selectedOrders={selectedOrders}
        onOrderSelect={(orderId) => {
          setSelectedOrders((prev) =>
            prev.includes(orderId)
              ? prev.filter((id) => id !== orderId)
              : [...prev, orderId]
          );
        }}
        onProcessOrder={processOrder}
        onShipOrder={shipOrder}
        onConfirmOrder={confirmOrder}
        onDeleteOrder={onDeleteOrder}
      />

      {selectedOrder && (
        <OrderDetailsSheet
          order={selectedOrder}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onProcessOrder={processOrder}
          onShipOrder={shipOrder}
          onConfirmOrder={confirmOrder}
          onDeleteOrder={onDeleteOrder}
          userRole={userRole}
        />
      )}
    </div>
  );
};
