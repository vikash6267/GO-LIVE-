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
import { useLocation } from "react-router-dom";

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
  
  const createOrder = location.state?.createOrder || false;
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(createOrder);

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

    fetchOrders();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <OrderFilters
          onSearch={setSearchQuery}
          onDateChange={setDateRange}
          onExport={() => console.log("Export functionality to be implemented")}
        />
    {userRole === "admin" && (
  <>
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

        <div className="mt-4">
          <CreateOrderForm
            onFormChange={(data) => console.log("Form changed:", data)}
            isEditing={false}
          />
        </div>
      </SheetContent>
    </Sheet>

    {/* Move the Show Products button outside of SheetTrigger */}
    <button
      onClick={() => setIsOpen(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
    >
       Add to Cart Product
    </button>
  </>
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
