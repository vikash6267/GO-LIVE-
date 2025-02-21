
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersContainer } from "@/components/orders/OrdersContainer";
import { useOrderManagement } from "@/components/orders/hooks/useOrderManagement";

export default function Orders() {
  const {
    handleProcessOrder,
    handleShipOrder,
    handleConfirmOrder,
    handleDeleteOrder
  } = useOrderManagement();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">
            Process and manage customer orders
          </p>
        </div>

        <OrdersContainer
          userRole="admin"
          onProcessOrder={handleProcessOrder}
          onShipOrder={handleShipOrder}
          onConfirmOrder={handleConfirmOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      </div>
    </DashboardLayout>
  );
}
