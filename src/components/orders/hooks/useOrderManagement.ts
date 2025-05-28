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

      const role = sessionStorage.getItem("userType");
      const adminRoles = ["admin"];
      console.log("Session:", session);
      console.log("User ID:", session.user.id);
      console.log("Role from sessionStorage:", role);

      let query = supabase
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
        .order("created_at", { ascending: false });

      if (role === "pharmacy") {
        query = query.eq("profile_id", session.user.id);
      }

      if (role === "group") {
        const { data: groupProfiles, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("group_id", session.user.id);

        if (error) throw new Error("Failed to fetch customer information");

        if (!groupProfiles || groupProfiles.length === 0)
          throw new Error("No customer profiles found");

        const userIds = groupProfiles.map((user) => user.id);
        console.log(userIds);
        query = query.in("profile_id", userIds);
      }

      const { data, error } = await query;

      console.log(data)
      if (error) throw error;

      const formattedOrders: OrderFormValues[] = (data as any[]).map(
        (order) => {
          const profileData = order.profiles || {};

          return {
            id: order.id || "",
            customer: order.profile_id || "",
            date: order.created_at || new Date().toISOString(),
            total: (order.total_amount || 0).toString(),
            status: order.status || "pending",
            payment_status: order.payment_status || "unpaid",
            customization: order.customization || false,
            poAccept: order.poAccept,
            shipping_cost: order.shipping_cost,
            quickBooksID: order.quickBooksID,
            tax_amount: order.tax_amount,
            void: order.void,
            voidReason: order.voidReason,
            customerInfo: order.customerInfo || {
              name:
                profileData.first_name && profileData.last_name
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : "Unknown",
              email: profileData.email || "",
              phone: profileData.mobile_phone || "",
              type: profileData.type || "Pharmacy",
              address: {
                street: profileData.company_name || "",
                city: "",
                state: "",
                zip_code: "",
              },
            },
            order_number: order.order_number,
            items: order.items || [],
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
            shippingAddress: order.shippingAddress
              ? {
                  fullName: order.shippingAddress.fullName || "",
                  email: order.shippingAddress.email || "",
                  phone: order.shippingAddress.phone || "",
                  address: {
                    street: order.shippingAddress.address?.street || "",
                    city: order.shippingAddress.address?.city || "",
                    state: order.shippingAddress.address?.state || "",
                    zip_code: order.shippingAddress.address?.zip_code || "",
                  },
                }
              : {
                  fullName:
                    profileData.first_name && profileData.last_name
                      ? `${profileData.first_name} ${profileData.last_name}`
                      : "",
                  email: profileData.email || "",
                  phone: profileData.mobile_phone || "",
                  address: {
                    street: profileData.company_name || "",
                    city: "",
                    state: "",
                    zip_code: "",
                  },
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

  // const handleDeleteOrder = async (orderId: string,reason: string): Promise<void> => {
  //   try {
  //     console.log(reason)
      
  //     const { error: invoiceDeleteError } = await supabase
  //       .from("invoices")
  //       .delete()
  //       .eq("order_id", orderId);

  //     if (invoiceDeleteError) throw invoiceDeleteError;

  //     const { error } = await supabase
  //       .from("orders")
  //       .delete()
  //       .eq("id", orderId);

  //     if (error) throw error;

  //     // Update the local state by removing the deleted order
  //     setOrders((prevOrders) =>
  //       prevOrders.filter((order) => order.id !== orderId)
  //     );

  //     toast({
  //       title: "Success",
  //       description: "Order deleted successfully",
  //     });

  //     // Close sheet if the deleted order was selected
  //     if (selectedOrder?.id === orderId) {
  //       setIsSheetOpen(false);
  //       setSelectedOrder(null);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting order:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete order",
  //       variant: "destructive",
  //     });
  //   }
  // };


const handleDeleteOrder = async (orderId: string, reason: string): Promise<void> => {
  try {
    console.log("Void Reason:", reason);

    // Step 1: Update the invoices table (set void = true, voidReason = reason)
    const { error: invoiceUpdateError } = await supabase
      .from("invoices")
      .update({ void: true, voidReason: reason })
      .eq("order_id", orderId);

    if (invoiceUpdateError) throw invoiceUpdateError;

    // Step 2: Update the orders table (set void = true, voidReason = reason)
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({ void: true, voidReason: reason })
      .eq("id", orderId);

    if (orderUpdateError) throw orderUpdateError;

    // Step 3: Update local state to reflect voided order
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, void: true, voidReason: reason } : order
      )
    );

    toast({
      title: "Success",
      description: "Order voided successfully",
    });

    // Step 4: Close sheet if the voided order was selected
    if (selectedOrder?.id === orderId) {
      setIsSheetOpen(false);
      setSelectedOrder(null);
    }
  } catch (error) {
    console.error("Error voiding order:", error);
    toast({
      title: "Error",
      description: "Failed to void order",
      variant: "destructive",
    });
  }
};




  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log(newStatus);
    try {
      // Update order and get the updated order in response
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId).
      select("*, profile_id(first_name, email_notifaction)")
        .single(); // Ensures only one order is fetched

      if (error) throw error;

      // Log the updated order
      console.log("Updated Order:", updatedOrder);

      // Send the updated order to the backend
      if (newStatus !== "processing" && updatedOrder.profile_id.email_notifaction ) {
        try {
          await axios.post("/order-status", updatedOrder);
          console.log("Order status sent successfully to backend.");
        } catch (apiError) {
          console.error("Failed to send order status to backend:", apiError);
        }
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
    loadOrders,
  };
};
