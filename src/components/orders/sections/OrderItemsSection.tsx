import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect,useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderItemRow } from "./components/OrderItemRow";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/supabaseClient";

interface OrderItemsSectionProps {
  orderItems: { id: number }[];
  form: UseFormReturn<OrderFormValues>;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function OrderItemsSection({ 
  orderItems, 
  form, 
  onAddItem, 
  onRemoveItem,
  onAddCartData
}) {
  const [products, setProducts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleProductChange = (value: string, index: number) => {
    const selectedProduct = products.find((product) => product.id === value);
    if (!selectedProduct) return;
  
    form.setValue(`items.${index}.productId`, selectedProduct.id); // Use the UUID
    form.setValue(`items.${index}.price`, selectedProduct.base_price);
  
    const currentItems = form.getValues("items");
    localStorage.setItem("cart", JSON.stringify(currentItems));
  
    toast({
      title: "Cart Updated",
      description: `${selectedProduct.name} added to your cart successfully.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order Items</h2>
        <div className="flex gap-2">
          <Button type="button" onClick={onAddCartData} variant="outline" size="sm">
            Add Cart Data
          </Button>
          <Button type="button" onClick={onAddItem} variant="outline" size="sm">
            Add Item
          </Button>
        </div>
      </div>

      {orderItems.map((item, index) => (
        <OrderItemRow
          key={item.id}
          index={index}
          form={form}
          onRemoveItem={onRemoveItem}
          onProductChange={(value) => handleProductChange(value, index)}
          products={products}
          showRemoveButton={orderItems.length > 1}
        />
      ))}
    </div>
  );
}