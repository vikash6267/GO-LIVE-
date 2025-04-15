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
import axios from "../../../../axiosconfig"
import { Link } from "react-router-dom";

import { useCart } from "@/hooks/use-cart";


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
  const [loading, setLoading] = useState(false);
  const [componyName, setComponyName] = useState("")


  const sendMail = async () => {
    setLoading(true);
    try {
      await axios.post("/paynow-user", order);
      console.log("Order status sent successfully to backend.");
      toast({
        title: "Payment Link sent successfully",
        description: "",
        variant: "default",
      });
    } catch (apiError) {
      console.error("Failed to send order status to backend:", apiError);
    }
    setLoading(false);
  };



  const fetchUser = async () => {

    try {
      if (!currentOrder || !currentOrder.customer) return

      const userID = currentOrder.customer


      const { data, error } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", userID)
        .maybeSingle();

      if (error) {
        console.error("🚨 Supabase Fetch Error:", error);
        return;
      }

      if (!data) {
        console.warn("⚠️ No user found for this email.");
        return;
      }

      console.log("✅ User Data:", data);
      setComponyName(data.company_name || "")

    } catch (error) {

    }
  };

  useEffect(() => {
    fetchUser()
  }, [currentOrder])


  const { clearCart } = useCart();

  useEffect(() => {
    console.log(isEditing);

    const clearCartIfEditing = async () => {
      if (isEditing) {
        console.log("object")
        await clearCart();
      }
    };

    clearCartIfEditing();
  }, [isEditing]);


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


              <div>
                <div className="flex gap-3 justify-center items-center min-w-full">
                  <Link to={`/pay-now?orderid=${currentOrder.id}`}

                    className="px-4 py-2 bg-red-600 text-white font-semibold text-sm md:text-base rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    Create Payment Link
                  </Link>
                  <button
                    onClick={sendMail}
                    disabled={loading}
                    className={`px-4 py-2 font-semibold text-sm md:text-base rounded-lg transition duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                  >
                    {loading ? "Sending..." : "Send Payment Link"}
                  </button>
                </div>

                <div className="flex w-full mt-2 justify-center">
                  <span className="text-red-700 font-semibold text-sm md:text-base bg-red-200 px-3 py-1 rounded-md">
                    Unpaid
                  </span>
                </div>
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

            <OrderCustomerInfo customerInfo={currentOrder.customerInfo} shippingAddress={currentOrder.shippingAddress} componyName={componyName} />
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
