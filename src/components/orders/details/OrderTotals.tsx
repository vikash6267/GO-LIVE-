import { useCart } from "@/hooks/use-cart";
import { OrderFormValues } from "../schemas/orderSchema";
import { useEffect, useState } from "react";

interface OrderTotalsProps {
  items: OrderFormValues["items"];
  paymentMethod: OrderFormValues["payment"]["method"];
  setIsCus?: React.Dispatch<React.SetStateAction<boolean>>; // ✅ Accept as prop
  isCus?: boolean;
}

export function OrderTotals({
  items,
  paymentMethod,
  setIsCus,
  isCus,
}: OrderTotalsProps) {
  const { cartItems, clearCart } = useCart();
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [customizePrice, setCustomizePrice] = useState(0);
  const [total, setTotal] = useState(0);
  const [tax, settax] = useState(0);
const taxper = sessionStorage.getItem("taxper")

  useEffect(() => {
    // Calculate subtotal
   
    const calculateSubtotal = (items: any[]) => {
      return items.reduce((total, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        return total + itemPrice ;
      }, 0);
    };

    // Calculate shipping cost
    const calculateShipping = (items: any[]) => {
      return sessionStorage.getItem("shipping") === "true"
        ? 0
        : items.reduce((total, item) => total + (item.shipping_cost || 0), 0);
    };

    // Calculate customization cost
    const calculateCustomizationCost = (items: any[]) => {
      return items.reduce((total, item) => {
        const customizationPrice = parseFloat(item?.customizations?.totalPrice) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return total + customizationPrice * quantity;
      }, 0);
    };

    const newSubtotal = calculateSubtotal(cartItems);
    const newShippingCost = calculateShipping(cartItems);
    const newCustomizePrice = calculateCustomizationCost(cartItems);
    const newtax = (newSubtotal * Number(taxper)) / 100;
   
    settax(newtax);
   
    setSubtotal(newSubtotal);
    setShippingCost(newShippingCost);
    setCustomizePrice(newCustomizePrice);
    setTotal(newSubtotal + newShippingCost + newCustomizePrice + newtax);
  }, [items]);

  return (
    <div className="space-y-2 border-t pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal:</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>
      {paymentMethod === "card" && (
        <div className="flex justify-between text-sm">
          {/* <span className="text-amber-600">Processing Fee (2%):</span>
          <span className="font-medium text-amber-600">
            ${processingFee.toFixed(2)}
          </span> */}
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-blue-600">Shipping ({"Standard"}):</span>
        <span className="font-medium text-blue-600">
          ${shippingCost.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between text-base font-bold">
        <span>Customizations Fee:</span>
        <span>${customizePrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-bold">
        <span>Tax({`${taxper}%`})</span>
        <span>${tax.toFixed(2)}</span>

      </div>
      <div className="flex justify-between text-base font-bold">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
