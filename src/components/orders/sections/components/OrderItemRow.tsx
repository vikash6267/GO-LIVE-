import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../schemas/orderSchema";

interface OrderItemRowProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  products: any[];
}

export const OrderItemRow = ({ index, form, products }: OrderItemRowProps) => {
  const allValues = form.getValues();
  const selectedProductId = form.getValues(`items.${index}.productId`);
  const selectedProduct = products.find((p) => p.id === selectedProductId);


  console.log(selectedProduct)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-4 border rounded-lg shadow-md">
      {/* Product Name */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Product</FormLabel>
        <p className="text-gray-900 font-medium">
          {selectedProduct?.name || "N/A"}
        </p>
      </div>

      {/* Quantity (Read-only) */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Quantity</FormLabel>
        <p className="text-gray-900 font-medium">
          {form.getValues(`items.${index}.quantity`) || "0"}
        </p>
      </div>

      {/* Sizes (Formatted Display) */}
      {/* Display Sizes Properly */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Sizes</FormLabel>
        <p className="text-gray-900 font-medium">
          {Array.isArray(form.getValues(`items.${index}.sizes`))
            ? form
                .getValues(`items.${index}.sizes`)
                .map((size) => `${size.size_value} ${size.size_unit}`) // Format size correctly
                .join(", ")
            : "N/A"}
        </p>
      </div>

      {/* Price (Read-only) */}
      <div>
        <FormLabel className="text-gray-700 font-semibold">Price</FormLabel>
        <p className="text-gray-900 font-medium">
          ${form.getValues(`items.${index}.price`) || "0.00"}
        </p>
      </div>
    </div>
  );
};
