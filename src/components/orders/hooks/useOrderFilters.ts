import { useState } from "react";
import { OrderFormValues } from "../schemas/orderSchema";

export const useOrderFilters = (orders: OrderFormValues[],po:boolean = true) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
console.log(orders)
  const filteredOrders = (orders || [])
  .filter(order =>
    statusFilter === "all" ? true : order.payment_status === statusFilter
  )
  .filter(order =>
    searchQuery
      ? order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  )
  .filter(order => {
    if (!dateRange.from || !dateRange.to) return true;
    const orderDate = new Date(order.date);
    return orderDate >= dateRange.from && orderDate <= dateRange.to;
  })
  .filter(order => order.poAccept === !po); // 🔥 This filters based on po value


  return {
    statusFilter,
    searchQuery,
    dateRange,
    setStatusFilter,
    setSearchQuery,
    setDateRange,
    filteredOrders
  };
};