import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../CreateGroupPricingDialog";

interface ProductSelectionProps {
  form: UseFormReturn<FormValues>;
  products: Array<{ id: string; name: string }>;
}

export function ProductSelection({ form, products }: ProductSelectionProps) {
  return (
    <FormField
      control={form.control}
      name="product"
      render={() => (
        <FormItem>
          <FormLabel>Product</FormLabel>
          <Controller
            control={form.control}
            name="product"
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={products.map((product) => ({
                  id: product.id,
                  name: product.name,
                }))}
                getOptionLabel={(e) => e.name}
                getOptionValue={(e) => e.id}
                onChange={(selected) =>
                  field.onChange(selected.map((item) => item.id))
                }
                value={products.filter((product) =>
                  field.value?.includes(product.id)
                )}
              />
            )}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
