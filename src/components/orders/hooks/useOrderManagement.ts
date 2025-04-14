import { useState, useEffect } from "react";
import { OrderFormValues } from "../schemas/orderSchema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient";
import axios from "../../../../axiosconfig";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to view orders",
          variant: "destructive",
        });
        return;
      }
  
      let ordersData = null;
      // const role = session.user.email || null;
  const role = sessionStorage.getItem('userType');
      console.log(session.user)
      // Refactor for user role checking
      const adminRoles = ["admin"];
  
      // Conditionally fetch orders based on role
      const query = supabase
        .from("orders")
        .select(`
          *,
          profiles (
            first_name, 
            last_name, 
            email, 
            mobile_phone, 
            type, 
            company_name
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }); // Order by most recent first
  
      if (role === "pharmacy" || role === "group") {
        // If user is not admin, fetch orders for their profile only
        query.eq('profile_id', session.user.id);
      }

    //   if (role === "group") {
    //     const { data, error } = await supabase
    //         .from("profiles")
    //         .select("id")
    //         .eq("group_id", session.user.id);
    
    //     if (error) {
    //         console.error("Failed to fetch customer information:", error);
    //         throw new Error("Failed to fetch customer information: " + error.message);
    //     }
    
    //     if (!data || data.length === 0) {
    //         throw new Error("No customer information found.");
    //     }
    
    //     console.log("Data", data);
    
    //     // Extract user IDs from the data array
    //     const userIds = data.map(user => user.id);
    
    //     // Fetch orders where profile id is in the list of userIds
    //     query.in("profile_id", userIds);
    // }
    
  
      const { data, error } = await query;
      if (error) throw error;
  
      console.log(data);
  
      const formattedOrders: OrderFormValues[] = (data as any[]).map((order) => {
        const profileData = order.profiles || {};
  console.log(data)
        return {
          id: order.id || "",
          customer: order.profile_id || "",
          date: order.created_at || new Date().toISOString(),
          total: (order.total_amount || 0).toString(),
          status: order.status || "pending",
          payment_status: order.payment_status || "unpaid",
          customization: order.customization || false,
          customerInfo: order.customerInfo ||  {
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
          order_number : order.order_number,
          items: order.items || [], // Ensure order.items exists
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
          shippingAddress: order.shippingAddress ? {
            fullName: order.shippingAddress.fullName || "",
            email: order.shippingAddress.email || "",
            phone: order.shippingAddress.phone || "",
      
            address: {
              street: order.shippingAddress.address.street || "",
              city: order.shippingAddress.address.city || "",
              state: order.shippingAddress.address.state || "",
              zip_code: order.shippingAddress.address.zip_code || "",
            },
          } : {
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
      });
  
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
      const { error:invoiceDeleteError } = await supabase
        .from("invoices")
        .delete()
        .eq("order_id", orderId);

      if (invoiceDeleteError) throw invoiceDeleteError;

      const { error } = await supabase
        .from("orders")
        .delete()
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
      console.log("object")
      // Update order and get the updated order in response
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select("*") // Returns the updated order
        .single(); // Ensures only one order is fetched
  
      if (error) throw error;
  
      // Log the updated order
      console.log("Updated Order:", updatedOrder);
  
     // Send the updated order to the backend
    try {
      await axios.post("/order-status", updatedOrder);
      console.log("Order status sent successfully to backend.");
    } catch (apiError) {
      console.error("Failed to send order status to backend:", apiError);
    }
      // Reload orders to sync state
      await loadOrders();
  
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
  
      return updatedOrder; // Return the updated order
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
    loadOrders
  };
};
