import { supabase } from "@/supabaseClient";

export const fetchDashboardData = async () => {
  try {
    // Fetch total revenue (using 'shipped' status instead of 'completed')
    const { data: revenueData, error: revenueError } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "shipped");

    const totalRevenue = revenueData?.reduce(
      (acc: number, order: any) => acc + parseFloat(order.total_amount),
      0
    ).toFixed(2) || "0.00";

    // Fetch order count by status
    const { data: activeOrdersData } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "processing");

    // Fetch pending invoices
    const { data: pendingInvoicesData } = await supabase
      .from("invoices")
      .select("*")
      .eq("status", "pending");

    // Fix the low stock query using a proper comparison
    const { data: lowStockProducts } = await supabase
      .rpc('get_low_stock_products');

    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id", { count: "exact" });

    return {
      totalRevenue,
      activeOrdersCount: activeOrdersData?.length || 0,
      pendingInvoicesCount: pendingInvoicesData?.length || 0,
      stockAlertCount: lowStockProducts?.length || 0,
      productCount: productData ? productData.length : 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      totalRevenue: "0.00",
      activeOrdersCount: 0,
      pendingInvoicesCount: 0,
      stockAlertCount: 0,
      productCount: 0,
    };
  }
};