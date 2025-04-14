
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersContainer } from "@/components/orders/OrdersContainer";
import { useOrderManagement } from "@/components/orders/hooks/useOrderManagement";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Orders() {
  const location = useLocation();
  const [poIs, setPoIs] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/admin/po')) {
      setPoIs(true);
    } else {
      setPoIs(false);
    }
  }, [location.pathname]);

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
          <h3 className="text-3xl font-bold tracking-tight">{poIs ? "Purchase Orders":"Orders Management"}</h3>
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
          poIs={poIs}
        />
      </div>
    </DashboardLayout>
  );
}
