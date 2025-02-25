import { useState, useEffect } from "react";
import { OrderFormValues } from "../schemas/orderSchema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient";

export const useOrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderFormValues[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderFormValues | null>(
    null
  );
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const loadOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          *,
          profiles (
            first_name, 
            last_name, 
            email, 
            mobile_phone, 
            type, 
            company_name
          )
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false }); // Order by most recent first

      if (ordersError) throw ordersError;

      console.log(ordersData);

      const formattedOrders: OrderFormValues[] = (ordersData as any[]).map(
        (order) => {
          const profileData = order.profiles || {};

          return {
            id: order.id || "",
            customer: order.profile_id || "",
            date: order.created_at || new Date().toISOString(),
            total: (order.total_amount || 0).toString(),
            status: order.status || "pending", // Make sure to use the status from the database
            payment_status: order.payment_status || "unpaid", // Make sure to use the status from the database
            customerInfo: {
              name:
                profileData.first_name && profileData.last_name
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : "Unknown",
              email: profileData.email || "",
              phone: profileData.mobile_phone || "",
              type: "Pharmacy",
              address: {
                street: profileData.company_name || "",
                city: "",
                state: "",
                zip_code: "",
              },
            },
            items: order.items,
            shipping: {
              method: order.shipping_method || "custom",
              cost: order.shipping_cost || 0,
              trackingNumber: order.tracking_number || "",
              estimatedDelivery: order.estimated_delivery || "",
            },
            payment: {
              method: "manual",
              notes: "",
            },
            specialInstructions: order.notes || "",
            shippingAddress: {
              fullName:
                profileData.first_name && profileData.last_name
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : "",
              street: "",
              city: "",
              state: "",
              zip_code: "",
            },
          };
        }
      );

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
  };

  // Refresh orders when the component mounts
  useEffect(() => {
    loadOrders();
  }, []);

  const handleOrderClick = (order: OrderFormValues) => {
    setSelectedOrder(order);
    setIsEditing(false);
    setIsSheetOpen(true);
  };

  const handleDeleteOrder = async (orderId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      // Update the local state by removing the deleted order
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      // Close sheet if the deleted order was selected
      if (selectedOrder?.id === orderId) {
        setIsSheetOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      // After successful update, reload all orders to ensure we have the latest data
      await loadOrders();

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleProcessOrder = async (orderId: string) => {
    return updateOrderStatus(orderId, "processing");
  };

  const handleShipOrder = async (orderId: string) => {
    return updateOrderStatus(orderId, "shipped");
  };

  const handleConfirmOrder = async (orderId: string) => {
    return updateOrderStatus(orderId, "pending");
  };

  return {
    orders,
    selectedOrder,
    selectedOrders,
    isEditing,
    isSheetOpen,
    setSelectedOrders,
    setIsEditing,
    setIsSheetOpen,
    handleOrderClick,
    handleProcessOrder,
    handleShipOrder,
    handleConfirmOrder,
    handleDeleteOrder,
  };
};
