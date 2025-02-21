
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderConfirmAction } from "./actions/OrderConfirmAction";
import { OrderProcessAction } from "./actions/OrderProcessAction";
import { OrderShipAction } from "./actions/OrderShipAction";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog } from "./actions/ConfirmationDialog";
import { canDeleteOrder } from "../utils/orderUtils";
import { useToast } from "@/hooks/use-toast";

interface OrderActionsProps {
  order: OrderFormValues;
  onProcessOrder?: (orderId: string) => void;
  onShipOrder?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => Promise<void>;
}

export const OrderActions = ({ 
  order,
  onProcessOrder,
  onShipOrder,
  onConfirmOrder,
  onDeleteOrder
}: OrderActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const status = order.status?.toLowerCase() || '';

  const handleDelete = async () => {
    if (!onDeleteOrder || !order.id) return;
    
    try {
      setIsLoading(true);
      await onDeleteOrder(order.id);
      toast({
        title: "Order deleted",
        description: `Order ${order.id} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const renderDeleteButton = () => (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsDeleteDialogOpen(true)}
        disabled={isLoading || !order.id}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
      
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </>
  );

  if (status === 'new') {
    return (
      <div className="flex gap-2">
        <OrderConfirmAction order={order} onConfirmOrder={onConfirmOrder} />
        {canDeleteOrder(order) && renderDeleteButton()}
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2">
        <OrderProcessAction order={order} onProcessOrder={onProcessOrder} />
        {canDeleteOrder(order) && renderDeleteButton()}
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex gap-2">
        <OrderShipAction order={order} onShipOrder={onShipOrder} />
        {canDeleteOrder(order) && renderDeleteButton()}
      </div>
    );
  }

  if (canDeleteOrder(order)) {
    return renderDeleteButton();
  }

  return null;
};
