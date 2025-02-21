import { toast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient";

export const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const orderId = `O${timestamp}${random}`;
  console.log('Generated Order ID:', orderId);
  return orderId;
};

export const calculateOrderTotal = (items: any[], shippingCost: number = 0) => {
  const itemsTotal = items.reduce((total, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + (itemPrice * quantity);
  }, 0);
  return itemsTotal + shippingCost;
};

export const formatOrderNumber = (id: string) => {
  return `ORD-${id.slice(0, 8)}`;
};

export const validateOrder = (order: any) => {
  if (!order.items || order.items.length === 0) {
    toast({
      title: "Invalid Order",
      description: "Order must contain at least one item",
      variant: "destructive",
    });
    return false;
  }

  if (!order.customerInfo || !order.customerInfo.name) {
    toast({
      title: "Invalid Order",
      description: "Customer information is required",
      variant: "destructive",
    });
    return false;
  }

  return true;
};

export const getOrderStatus = (order: any) => {
  if (!order.status) return 'pending';
  return order.status.toLowerCase();
};

export const canEditOrder = (order: any) => {
  const status = getOrderStatus(order);
  return ['pending', 'new'].includes(status);
};

export const canCancelOrder = (order: any) => {
  const status = getOrderStatus(order);
  return ['pending', 'new', 'processing'].includes(status);
};

export const canDeleteOrder = (order: any) => {
  const status = getOrderStatus(order);
  return ['cancelled', 'delivered', 'new', 'pending'].includes(status);
};

export const getOrderStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    new: 'New Order',
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return statusMap[status.toLowerCase()] || status;
};

export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  if (!orderId) {
    console.error('No order ID provided to updateOrderStatus');
    throw new Error('Order ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    if (!data) {
      console.error(`No order found with ID: ${orderId}`);
      throw new Error('Order not found');
    }

    console.log(`Order ${orderId} status updated to: ${newStatus}`);
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update order status');
  }
};
