import { OrderFormValues } from "../schemas/orderSchema";

interface OrderItemsListProps {
  items: OrderFormValues['items'];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Order Items</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="border p-2 rounded">
            <p>Product: {item.productId}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ${item.price.toFixed(2)}</p>
            {item.notes && <p>Notes: {item.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}