import {
  FormLabel,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../schemas/orderSchema";
import { removeFromCart } from "@/store/actions/cartActions";

interface OrderItemRowProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  products: any[];
 
}

export const OrderItemRow = ({ index, form, products }: OrderItemRowProps) => {
  const allValues = form.getValues();
  const selectedProductId = form.getValues(`items.${index}`);
  const selectedProduct = products.find((p) => p.id === selectedProductId.productId);

  // Handle Remove Product from Form and Cart
// Handle Remove Product from Form and Cart
const handleRemove = () => {
  const productId = selectedProductId.productId;

  // Remove from the form
  const updatedItems = allValues.items.filter((_, i) => i !== index);
  form.setValue("items", updatedItems);

  // Trigger re-render by updating form state
  form.trigger("items");

  // Remove from the cart if present
  removeFromCart(productId);
};


  return (
    <div className="flex flex-col p-4 border rounded-lg shadow-md">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      {/* Product Name */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Product</FormLabel>
        <p className="text-gray-900 font-medium">{selectedProduct?.name || selectedProductId?.name || "Custom"}</p>
      </div>

      {/* Quantity (Read-only) */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Quantity</FormLabel>
        <p className="text-gray-900 font-medium">{form.getValues(`items.${index}.quantity`) || "0"}</p>
      </div>

      {/* Sizes (Formatted Display) */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Sizes</FormLabel>
        <div className="text-gray-900 font-medium">
          {Array.isArray(form.getValues(`items.${index}.sizes`))
            ? form.getValues(`items.${index}.sizes`).map((size, i) => (
                <div key={i} className="mb-1">
                  {size.size_value}
                  {size.size_unit?.toUpperCase()} ({size.quantity})
                </div>
              ))
            : "N/A"}
        </div>
      </div>

      {/* Price (Read-only) */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Price</FormLabel>
        <p className="text-gray-900 font-medium">${form.getValues(`items.${index}.price`).toFixed(2) || "0.00"}</p>
      </div>
    </div>

    {/* Remove Button - Separate from grid */}
    <div className="flex justify-end mt-4">
      <button
        type="button"
        className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg"
        onClick={handleRemove}
      >
        Remove
      </button>
    </div>
  </div>
  );
};
