import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DollarSign, ShoppingCart, FileText, AlertTriangle, TrendingUp, Users, PackageSearch, Bell } from "lucide-react";
import { fetchDashboardData } from "./dashboardService";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: "0.00",
    activeOrdersCount: 0,
    pendingInvoicesCount: 0,
    stockAlertCount: 0,
    productCount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchDashboardData();
      setDashboardData(data);
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Revenue",
      value: `$${dashboardData.totalRevenue}`,
      change: "+15.2%",
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      subtitle: "Compared to last month",
      trend: "up" as const,
    },
    {
      title: "Active Orders",
      value: `${dashboardData.activeOrdersCount}`,
      change: "Processing",
      icon: <ShoppingCart className="h-5 w-5 text-primary" />,
      subtitle: "orders",
      trend: "neutral" as const,
    },
    {
      title: "Pending Invoices",
      value: `${dashboardData.pendingInvoicesCount}`,
      change: "Pending",
      icon: <FileText className="h-5 w-5 text-primary" />,
      subtitle: "invoices",
      trend: "neutral" as const,
    },
    {
      title: "Stock Alerts",
      value: `${dashboardData.stockAlertCount}`,
      change: "Items Low Stock",
      icon: <AlertTriangle className="h-5 w-5 text-primary" />,
      subtitle: "alerts",
      trend: "down" as const,
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your business, view analytics, and handle administrative tasks.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="rounded-full bg-primary/10 p-2">{stat.icon}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center text-sm">
                    {stat.trend === "up" ? (
                      <TrendingUp className="mr-1 h-4 w-4 text-success" />
                    ) : stat.trend === "down" ? (
                      <TrendingUp className="mr-1 h-4 w-4 text-destructive rotate-180" />
                    ) : null}
                    <span className="text-muted-foreground">
                      {stat.change} {stat.subtitle}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-6">
          <Card className="col-span-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Revenue Overview</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">Last 6 months</p>
                </div>
              </div>
              <RevenueChart />
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Active Users</span>
                  </div>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PackageSearch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Products</span>
                  </div>
                  <span className="text-sm font-medium">{dashboardData?.productCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Notifications</span>
                  </div>
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
