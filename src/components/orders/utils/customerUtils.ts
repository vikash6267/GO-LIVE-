import { OrderFormValues } from "../schemas/orderSchema";

export const getCustomerName = (order: OrderFormValues) => {
  if (order.shippingAddress?.fullName) {
    return order.shippingAddress.fullName;
  }
  if (order.customerInfo?.name) {
    return order.customerInfo.name;
  }
  return order.customer || 'N/A';
};

export const formatTotal = (total: string | undefined) => {
  if (!total) return "$0.00";
  const numericTotal = parseFloat(total);
  return isNaN(numericTotal) ? "$0.00" : `$${numericTotal.toFixed(2)}`;
};