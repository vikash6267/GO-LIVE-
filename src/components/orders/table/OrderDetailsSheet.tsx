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


  const handlePayNow = async () => {
    try {
      setIsProcessingPayment(true);

      let apiLoginId = "5KP3u95bQpv"; // Test API Login ID
      let transactionKey = "346HZ32z3fP4hTG2"; // Test Transaction Key

      // Get Authorize.Net credentials from Supabase (for production use)
      const { data: credentials, error: credentialsError } = await supabase
        .from("secrets")
        .select("value")
        .in("name", ["AUTHORIZE_NET_LOGIN_ID", "AUTHORIZE_NET_TRANSACTION_KEY"])
        .order("name");

      if (!credentialsError && credentials && credentials.length === 2) {
        // Use production credentials if available
        apiLoginId = credentials[0].value;
        transactionKey = credentials[1].value;
      }

      const response = await processACHPayment({
        accountType: "checking",
        accountName: currentOrder.customerInfo.name,
        routingNumber: "122000661", // Test routing number
        accountNumber: "1234567890",
        amount: parseFloat(currentOrder.total),
        customerEmail: currentOrder.customerInfo.email,
        customerName: currentOrder.customerInfo.name,
        apiLoginId,
        transactionKey,
        testMode: true,
      });

      if (response.success) {
        console.log("Updating Order ID:", currentOrder.id); // Debugging

        // Update order payment status in database
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid", // Use correct column name
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentOrder.id);

        if (updateError) throw updateError;

        setCurrentOrder((prev) => ({ ...prev, payment_status: "paid" }));

        toast({
          title: "Payment Successful",
          description: `Transaction ID: ${response.transactionId}`,
        });
      } else {
        throw new Error(response.error?.text || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };


  if (!currentOrder) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-3xl overflow-y-auto z-50">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            {isEditing ? "Edit order details" : "View order details"}
          </SheetDescription>
        </SheetHeader>

        {isEditing ? (
          <div className="mt-6">
            <CreateOrderForm initialData={currentOrder} />
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="mt-4"
            >
              Cancel Edit
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Status</h3>
              {userRole === "admin" && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </Button>
              )}
            </div>

            <OrderWorkflowStatus status={currentOrder.status} />

            {currentOrder.payment_status !== "paid" && (
              <div className="flex justify-end text-red-900 font-bold">
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

            <OrderCustomerInfo customerInfo={currentOrder.customerInfo} />
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
