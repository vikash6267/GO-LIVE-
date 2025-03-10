import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../schemas/orderSchema";
import { OrderItemRow } from "./components/OrderItemRow";
import { supabase } from "@/supabaseClient";

interface OrderItemsSectionProps {
  orderItems: { id: number }[];
  form: UseFormReturn<OrderFormValues>;
  setIsCus?: React.Dispatch<React.SetStateAction<boolean>>;
  isCus?: boolean;
}

export function OrderItemsSection({ orderItems, form, setIsCus, isCus }) {
  const [products, setProducts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
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

        <button
          type="button" // Prevents accidental form submission
          onClick={() => setIsCus?.((prev) => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {isCus ? "Disable Customization" : "Enable Customization"}
        </button>
      </div>

      {allValues?.items?.map((item, index) => (
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
