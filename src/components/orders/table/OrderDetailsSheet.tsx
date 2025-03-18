import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Edit, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateOrderForm } from "../CreateOrderForm";
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderCustomerInfo } from "../details/OrderCustomerInfo";
import { OrderItemsList } from "../details/OrderItemsList";
import { OrderPaymentInfo } from "../details/OrderPaymentInfo";
import { OrderWorkflowStatus } from "../workflow/OrderWorkflowStatus";
import { OrderActions } from "./OrderActions";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { processACHPayment } from "../utils/authorizeNetUtils";
import { supabase } from "@/supabaseClient";
import PaymentForm from "@/components/PaymentModal";

interface OrderDetailsSheetProps {
  order: OrderFormValues;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcessOrder?: (orderId: string) => void;
  onShipOrder?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => Promise<void>;
  userRole?: "admin" | "pharmacy" | "group" | "hospital";
  
}

export const OrderDetailsSheet = ({
  order,
  isEditing,
  setIsEditing,
  open,
  onOpenChange,
  onProcessOrder,
  onShipOrder,
  onConfirmOrder,
  onDeleteOrder,

  userRole = "pharmacy",
}: OrderDetailsSheetProps) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState<OrderFormValues>(order);
console.log(currentOrder)
  // Update currentOrder when order prop changes
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const handleStatusUpdate = async (action: "process" | "ship" | "confirm") => {
    if (!currentOrder.id) return;

    try {
      switch (action) {
        case "process":
          if (onProcessOrder) {
            await onProcessOrder(currentOrder.id);
            setCurrentOrder((prev) => ({ ...prev, status: "processing" }));
          }
          break;
        case "ship":
          if (onShipOrder) {
            await onShipOrder(currentOrder.id);
            setCurrentOrder((prev) => ({ ...prev, status: "shipped" }));
          }
          break;
        case "confirm":
          if (onConfirmOrder) {
            await onConfirmOrder(currentOrder.id);
            setCurrentOrder((prev) => ({ ...prev, status: "pending" }));
          }
          break;
      }
    } catch (error) {
      console.error(`Error updating order status:`, error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };




  if (!currentOrder) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full max-w-full md:max-w-3xl overflow-y-auto z-50 p-4 md:p-6">
      <SheetHeader>
        <SheetTitle className="text-lg md:text-xl">Order Details</SheetTitle>
        <SheetDescription className="text-sm md:text-base">
          {isEditing ? "Edit order details" : "View order details"}
        </SheetDescription>
      </SheetHeader>
  
      {isEditing ? (
        <div className="mt-6">
          <CreateOrderForm initialData={currentOrder} isEditing={isEditing} />
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="mt-4 w-full md:w-auto"
          >
            Cancel Edit
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <h3 className="text-base md:text-lg font-semibold">Order Status</h3>
            <span className="text-sm md:text-base">Order Number: {currentOrder.order_number}</span>
            {userRole === "admin" && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="w-full md:w-auto"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </Button>
            )}
          </div>
  
          <OrderWorkflowStatus status={currentOrder.status} />
  
          {currentOrder.payment_status !== "paid" && (
            <div className="flex justify-end text-red-900 font-bold text-sm md:text-base">
              UnPaid
            </div>
          )}
  
          {userRole === "admin" && (
            <div className="flex justify-end">
              <OrderActions
                order={currentOrder}
                onProcessOrder={() => handleStatusUpdate("process")}
                onShipOrder={() => handleStatusUpdate("ship")}
                onConfirmOrder={() => handleStatusUpdate("confirm")}
                onDeleteOrder={onDeleteOrder}
              />
            </div>
          )}
  
          <OrderCustomerInfo customerInfo={currentOrder.customerInfo} shippingAddress={currentOrder.shippingAddress} />
          <OrderItemsList items={currentOrder.items} />
          <OrderPaymentInfo
            payment={currentOrder.payment}
            specialInstructions={currentOrder.specialInstructions}
          />
        </div>
      )}
    </SheetContent>
  </Sheet>
  
  );
};
