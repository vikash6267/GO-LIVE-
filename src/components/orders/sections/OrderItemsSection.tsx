import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderItemRow } from "./components/OrderItemRow";
import { supabase } from "@/supabaseClient";

interface OrderItemsSectionProps {
  orderItems: { id: number }[];
  form: UseFormReturn<OrderFormValues>;
}

export function OrderItemsSection({ orderItems, form }) {
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

  const allValues = form.getValues();
  console.log("All Order Values:", allValues);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order Items</h2>
      </div>

      {allValues?.items.map((item, index) => (
        <OrderItemRow
          key={item.id}
          index={index}
          form={form}
          products={products}
        />
      ))}
    </div>
  );
}
