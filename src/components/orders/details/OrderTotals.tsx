import { useCart } from "@/hooks/use-cart";
import { OrderFormValues } from "../schemas/orderSchema";

interface OrderTotalsProps {
  items: OrderFormValues["items"];
  paymentMethod: OrderFormValues["payment"]["method"];
}

export function OrderTotals({ items, paymentMethod }: OrderTotalsProps) {
  const { cartItems, clearCart } = useCart();


  const shipping =
  sessionStorage.getItem("shipping") === "true"
    ? 0
    : cartItems.reduce((total, item) => total + (item.shipping_cost || 0), 0);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const processingFee = paymentMethod === "card" ? subtotal * 0.02 : 0;
  const shippingCost = shipping || 0;
  const total = subtotal + processingFee + shippingCost;

  return (
    <div className="space-y-2 border-t pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal:</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>
      {paymentMethod === "card" && (
        <div className="flex justify-between text-sm">
          <span className="text-amber-600">Processing Fee (2%):</span>
          <span className="font-medium text-amber-600">
            ${processingFee.toFixed(2)}
          </span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-blue-600">Shipping ({"Standard"}):</span>
        <span className="font-medium text-blue-600">
          ${shippingCost.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between text-base font-bold">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
