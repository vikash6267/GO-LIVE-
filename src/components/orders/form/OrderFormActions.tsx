import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderPreview } from "../OrderPreview";

interface OrderFormActionsProps {
  orderData: OrderFormValues;
  isSubmitting?: boolean;
  isValidating?: boolean; // Added this prop
}

export function OrderFormActions({ orderData, isSubmitting, isValidating }: OrderFormActionsProps) {
  return (
    <div className="flex flex-col md:flex-row justify-end gap-4">
      <OrderPreview orderData={orderData} />
      <Button 
        type="submit" 
        size="lg" 
        disabled={isSubmitting || isValidating}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isSubmitting ? "Creating Order..." : "Create Order"}
      </Button>
    </div>
  );
}