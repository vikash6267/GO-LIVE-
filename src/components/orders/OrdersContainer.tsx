import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersList } from "./table/OrdersList";
import { StatusFilter } from "./table/StatusFilter";
import { OrderDetailsSheet } from "./table/OrderDetailsSheet";
import { OrderFilters } from "./table/OrderFilters";
import { useOrderFilters } from "./hooks/useOrderFilters";
import { useOrderManagement } from "./hooks/useOrderManagement";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, Package, PlusCircle } from "lucide-react";
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
import { CSVLink } from "react-csv";
import { useCart } from "@/hooks/use-cart";
import { useDispatch } from "react-redux";
import { updateCartPrice } from "@/store/actions/cartActions";


const exportToCSV = (orders: OrderFormValues[]) => {
  if (!orders || orders.length === 0) {
    return { data: [], headers: [], filename: "orders.csv" };
  }

  const headers = [
    { label: "Order Number", key: "order_number" },
    { label: "Customer Name", key: "customerInfo.name" },
    { label: "Email", key: "customerInfo.email" },
    { label: "Phone", key: "customerInfo.phone" },
    { label: "Total Amount", key: "total" },
    { label: "Status", key: "status" },
    { label: "Payment Status", key: "payment_status" },
    { label: "Customization", key: "customization" },
    { label: "Order Date", key: "date" },
    { label: "Shipping Method", key: "shipping.method" },
    { label: "Shipping Cost", key: "shipping.cost" },
    { label: "Tracking Number", key: "shipping.trackingNumber" },
    { label: "Estimated Delivery", key: "shipping.estimatedDelivery" },
    { label: "Special Instructions", key: "specialInstructions" },
    { label: "Shipping Address", key: "shippingAddress.address.street" },
    { label: "City", key: "shippingAddress.address.city" },
    { label: "State", key: "shippingAddress.address.state" },
    { label: "Zip Code", key: "shippingAddress.address.zip_code" },
  ];

  return { data: orders, headers, filename: "orders.csv" };
};


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
 const[orderStatus,setOrderStatus] = useState<string>("");

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

  const { cartItems } = useCart();
  const dispatch = useDispatch();

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
          .select("id, display_name, type,email");

        if (error) {
          console.error("Failed to fetch customer information:", error);
          throw new Error(`Failed to fetch customer information: ${error.message}`);
        }

        console.log("Fetched pharmacies:", data);
        setUserData(data);

        const userEmail = sessionStorage.getItem("userEmail")?.toLowerCase(); // Convert session email to lowercase

        console.log("User Email from Session:", userEmail);
        console.log("Original Data:", data);
        
        // Logged-in admin ko find karein
        const loggedInAdmin = data.find(pharmacy => pharmacy.email.toLowerCase() === userEmail && pharmacy.type === "admin");
        
        console.log("Logged-in Admin:", loggedInAdmin);
        
        // Admin aur Non-Admin dono ko filter karein
        const filteredData = data.filter(pharmacy => {
          // Agar yeh logged-in admin hai toh isko rakho
          if (loggedInAdmin && pharmacy.email.toLowerCase() === userEmail && pharmacy.type === "admin") {
            return true;
          }
          // Non-admin ko allow karo
          return pharmacy.type !== "admin";
        });
        
        console.log("Filtered Data (After Removing Unwanted Admins):", filteredData);
        
        // Sorting aur mapping
        const sortedOptions = filteredData
          .map((pharmacy) => ({
            value: pharmacy.id,
            label: pharmacy.type === "admin" ? "Custom" : pharmacy.display_name, // Sirf logged-in admin ke liye "Custom"
            isCustom: pharmacy.type === "admin" ? 0 : 1, // Admin (Custom) ko 0, baki sab 1
          }))
          .sort((a, b) => a.isCustom - b.isCustom); // "Custom" sabse upar
        
        console.log("Final Sorted Options:", sortedOptions);
        
        console.log(sortedOptions);
        
        setOptions(sortedOptions);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };



    fetchUsers();
    fetchOrders();
  }, [orderStatus]); // Ensure dependencies are correctly placed if needed



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
      const { data: groupData, error: fetchError } = await supabase
      .from("group_pricing")
      .select("*");

    if (fetchError) {
      console.error("Error fetching group pricing:", fetchError.message);
      return;
    }

    console.log("Fetched Group Data:", groupData);

    let ID = data.id;

      const handlePriceChange = (productId: string, sizeId: string, newPrice: number) => {
        dispatch(updateCartPrice(productId, sizeId, newPrice));
      };
    

      

      const mappedCart = await Promise.all(
        cartItems.map(async (item) => {
          const updatedSizes = await Promise.all(
            (item.sizes || []).map(async (size) => {
              // Fetch fresh size info from Supabase
              const { data: sizeFetch, error: fetchSizeError } = await supabase
                .from("product_sizes")
                .select("size_value, price")
                .eq("id", size.id);
      
              if (fetchSizeError) throw fetchSizeError;
      
              let newPrice = sizeFetch?.[0]?.price || size.price;
      
              await handlePriceChange(item.productId, size.id, newPrice);
      
              // Check for applicable group pricing
              const applicableGroup = groupData.find(
                (group) =>
                  group.group_ids.includes(ID) &&
                  group.product_arrayjson.some((product) => product.product_id === size.id)
              );
      
              if (applicableGroup) {
                const groupProduct = applicableGroup.product_arrayjson.find(
                  (product) => product.product_id === size.id
                );
      
                if (groupProduct && groupProduct.new_price) {
                  newPrice = parseFloat(groupProduct.new_price) || newPrice;
                  await handlePriceChange(item.productId, size.id, newPrice);
                }
              }
      
              return {
                ...size,
                price: newPrice,
                originalPrice: size.price === newPrice ? 0 : size.price,
              };
            })
          );
      
          return {
            ...item,
            sizes: updatedSizes,
          };
        })
      );
      


      console.log(mappedCart)

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

  useEffect(()=>{
    setSelectedPharmacy("")
    setOrderData(null)

  },[isCreateOrderOpen])

  return (
    <div className="space-y-4">


<div className="flex flex-col md:flex-row flex-wrap justify-between items-center gap-2 p-2 bg-card rounded-lg shadow-sm border">
  <OrderFilters
    onSearch={setSearchQuery}
    onDateChange={setDateRange}
    onExport={() => console.log("Export functionality to be implemented")}
  />

  <CSVLink {...exportToCSV(filteredOrders)} className="btn btn-primary">
    <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export Orders
      </Button>
  </CSVLink>



  {userRole === "admin" && (
    <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 w-full md:w-auto">
      <Sheet open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <SheetTrigger asChild>
          <Button className="w-auto min-w-fit px-3 py-2 text-sm">
            <PlusCircle className="mr-1 h-4 w-4" />
            Create Order
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[90vw] sm:max-w-[640px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Order</SheetTitle>
          </SheetHeader>

          <div className="mb-4 mt-2">
            <Label htmlFor="pharmacy-select">Select Pharmacy</Label>
            <Select
              id="pharmacy-select"
              options={options}
              value={options.find((option) => option.value === selectedPharmacy)}
              onChange={(selectedOption) => handlePharmacyChange(selectedOption.value)}
              placeholder="Search pharmacy..."
              isSearchable
              className="w-full mt-1"
            />
          </div>
          {orderData?.customerInfo && (
            <div className="mt-2">
              <CreateOrderForm isEditing={false} initialData={orderData} onFormChange={handleFormChange} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary" className="w-auto min-w-fit px-3 py-2 bg-blue-500 text-white text-sm">
            <Package className="mr-1 h-4 w-4" />
            All Products
          </Button>
        </SheetTrigger>
      </Sheet>
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
        setOrderStatus={setOrderStatus}
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
