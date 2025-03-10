import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderPreview } from "../OrderPreview";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderFormActionsProps {
  orderData: OrderFormValues;
  form: any;
  isSubmitting?: boolean;
  isValidating?: boolean; // Added this prop
  isEditing?: boolean; // Added this prop
  setModalIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCus?: React.Dispatch<React.SetStateAction<boolean>>;
  isCus?: boolean;
}

export function OrderFormActions({
  orderData,
  isSubmitting,
  isValidating,
  isEditing,
  form,
  setModalIsOpen,
  setIsCus, // ✅ Added missing prop
  isCus, // ✅ Added missing prop
}: OrderFormActionsProps) {
  const { toast } = useToast();

  const onSubmit = async () => {
    console.log(orderData);
    const updatedData = orderData;
    const orderId = orderData.id;
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          profile_id: updatedData.customer || null, // Ensure profile_id is valid
          customerInfo: updatedData.customerInfo || null,
          updated_at: new Date().toISOString(),
          items: updatedData.items || [], // Ensure it's a valid JSON array
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
        throw error;
      }

      console.log("Order updated successfully!");
      toast({
        title: "Order Status !",
        description: "Order updated successfully!",
      });

      setTimeout(() => {
        window.location.href = "/admin/orders"; // Option 2: Redirect with refresh
      }, 500);
      return { success: true };
    } catch (error) {
      console.error("Update order error:", error);
      return { success: false, error };
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-end gap-2">
      <OrderPreview orderData={orderData} setIsCus={setIsCus} isCus={isCus} />
      {!isEditing && (
        <>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isValidating}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating Order..." : "Create Order"}
          </Button>

          <p
            onClick={() => setModalIsOpen(true)}
            className="flex items-center gap-3  text-center justify-center px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition duration-300 active:scale-95 select-none"
          >
            <ShoppingCart className="h-5 w-5" /> Pay And Order
          </p>
        </>
      )}

      {isEditing && (
        <p
          onClick={onSubmit}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition duration-300 active:scale-95 select-none"
        >
          <ShoppingCart className="h-5 w-5" />
          {isSubmitting ? "Updating Order..." : "Update Order"}
        </p>
      )}
    </div>
  );
}
