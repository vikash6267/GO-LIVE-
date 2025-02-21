import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersContainer } from "@/components/orders/OrdersContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PharmacyOrders() {
  return (
    <DashboardLayout role="pharmacy">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orders History</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersContainer userRole={"pharmacy"} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}