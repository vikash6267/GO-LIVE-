import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../schemas/orderSchema";
import { useToast } from "@/hooks/use-toast";

interface OrderItemRowProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  onRemoveItem: (index: number) => void;
  onProductChange: (value: string, index: number) => void;
  showRemoveButton: boolean;
}

export const OrderItemRow = ({ 
  index, 
  form, 
  onRemoveItem, 
  onProductChange,
  showRemoveButton,
  products 
}) => {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-4 border rounded-lg">
      <FormField
        control={form.control}
        name={`items.${index}.productId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select 
          onValueChange={(value) => onProductChange(value, index)} 
          value={form.getValues(`items.${index}.productId`)} // Ensure it matches the UUID
>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select product" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    {products.map((product) => (
      <SelectItem 
        key={product.id} 
        value={product.id} // UUID as value
      >
        {product.name} (${product.base_price})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quantity Field */}
      <FormField
        control={form.control}
        name={`items.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  field.onChange(value);
                  const currentItems = form.getValues('items');
                  localStorage.setItem('cart', JSON.stringify(currentItems));
                }} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price Field */}
      <FormField
        control={form.control}
        name={`items.${index}.price`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01"
                {...field} 
                disabled
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-end space-x-2">
        {showRemoveButton && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="mb-6"
            onClick={() => {
              onRemoveItem(index);
              const currentItems = form.getValues('items');
              currentItems.splice(index, 1);
              localStorage.setItem('cart', JSON.stringify(currentItems));
              
              toast({
                title: "Item Removed",
                description: "Item removed from your cart successfully.",
              });
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};