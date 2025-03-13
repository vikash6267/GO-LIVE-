import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Controller, UseFormReturn } from "react-hook-form";
import Select from "react-select";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react"; // Trash Icon for Delete
import { FormValues } from "../CreateGroupPricingDialog";



interface ProductSelectionProps {
  form: UseFormReturn<FormValues>;
  products: any[];
}

export function ProductSelection({ form, products }: ProductSelectionProps) {
  const [selectedProducts, setSelectedProducts] = useState<any[]>(form.watch("product_arrayjson") || []);

  useEffect(() => {
    form.setValue("product_arrayjson", selectedProducts, { shouldValidate: true });

    console.log(form.getValues())
  }, [selectedProducts, form]);

  // ✅ Handle Product Selection (Multiple Products Save)
  const handleProductChange = (selectedOptions: any) => {
    if (!selectedOptions) return;

    const newProducts = selectedOptions.map((option: any) => ({
      product_id: option.value,
      product_name: option.label,
      groupLabel: option.groupLabel,
      actual_price: option.actual_price || 0,
      new_price: "",
    }));

    setSelectedProducts(newProducts);
    form.setValue("product_arrayjson", newProducts, { shouldValidate: true }); // ✅ Save to form
  };

  // ✅ Handle Price Change
  const handlePriceChange = (productId: string, newPrice: string) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.product_id === productId ? { ...product, new_price: newPrice } : product
    );
    setSelectedProducts(updatedProducts);
    form.setValue("product_arrayjson", updatedProducts, { shouldValidate: true }); // ✅ Save to form
  };

  // ✅ Handle Product Deletion
  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = selectedProducts.filter((product) => product.product_id !== productId);
    setSelectedProducts(updatedProducts);
    form.setValue("product_arrayjson", updatedProducts, { shouldValidate: true }); // ✅ Save to form
  };

  // ✅ Flatten available products for Select dropdown
  const availableProducts = products.map(group => ({
    label: group.label, // ग्रुप का नाम
    options: group.options.map(option => ({
      ...option,
      label: `${option.label} (${group.label})`, // प्रोडक्ट के नाम के साथ ग्रुप नाम जोड़ना
      value: option.value
    }))
  }));
  

  return (
    <div>
      {/* ✅ Product Selection Dropdown */}
      <FormItem>
        <FormLabel>Product</FormLabel>
        <Controller
          control={form.control}
          name="product_arrayjson"
          render={({ field }) => (
            <Select
            {...field}
            isMulti
            options={availableProducts} // ✅ Proper grouped options
            getOptionLabel={(e) => `${e.label}`} // ❌ गलत दोहराव हटा दिया
            getOptionValue={(e) => e.value}
            onChange={handleProductChange}
            value={selectedProducts.map((p) => ({
              value: p.product_id,
              label: `${p.product_name} `, // सही तरीके से groupLabel दिखाना
            }))}
            filterOption={(option, input) =>
              option.data.label?.toLowerCase().includes(input.toLowerCase())
            }
            menuPlacement="auto"
          />
          
          
          )}
        />
        <FormMessage />
      </FormItem>

      {/* ✅ Selected Products List */}
      {selectedProducts.length > 0 && (
        <div className="mt-4 border p-3 rounded">
          <h3 className="font-semibold mb-2">Selected Products</h3>
          {selectedProducts.map((product) => (
            <div key={product.product_id} className="flex items-center justify-between mb-2 p-2 border-b">
              <span className="text-sm">
                <strong>Product:</strong> {product.product_name} 
              </span>
              <span className="text-sm">
                <strong>Actual Price:</strong> ${product.actual_price}
              </span>
              <Input
                type="number"
                placeholder="Enter New Price"
                value={product.new_price}
                onChange={(e) => handlePriceChange(product.product_id, e.target.value)}
                className="w-24 ml-2"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteProduct(product.product_id)}
                className="ml-2"
              >
                <Trash size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
