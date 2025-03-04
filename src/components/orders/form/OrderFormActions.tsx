import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderPreview } from "../OrderPreview";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderFormActionsProps {
  orderData: OrderFormValues;
  isSubmitting?: boolean;
  isValidating?: boolean; // Added this prop
  isEditing?: boolean; // Added this prop

}

export function OrderFormActions({ orderData, isSubmitting, isValidating,isEditing }: OrderFormActionsProps) {
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
    <div className="flex flex-col md:flex-row justify-end gap-4">
      <OrderPreview orderData={orderData} />
      {

       !isEditing &&  <Button 
        type="submit" 
        size="lg" 
        disabled={isSubmitting || isValidating}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isSubmitting ? "Creating Order..." : "Create Order"}
      </Button>}

      {
        isEditing &&   <p
        onClick={onSubmit}
        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition duration-300 active:scale-95 select-none"
      >
        <ShoppingCart className="h-5 w-5" />
        {isSubmitting ? "Updating Order..." : "Update Order"}
      </p>

      }
    </div>
  );
}