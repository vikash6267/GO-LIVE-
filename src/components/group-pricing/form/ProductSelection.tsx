import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../CreateGroupPricingDialog";

interface ProductSelectionProps {
  form: UseFormReturn<FormValues>;
  products: any;
}

export function ProductSelection({ form, products }: ProductSelectionProps) {
  return (


    <FormItem>
    <FormLabel>Product</FormLabel>
    <Controller
      control={form.control}
      name="product"
      render={({ field }) => (
        <Select
          {...field}
          isMulti
          options={products}
          getOptionLabel={(e) => e.label}
          getOptionValue={(e) => e.value}
          onChange={(selected) =>
            field.onChange(selected.map((item) => item.value))
          }
          value={products
            .flatMap(group => group.options)
            .filter(size => field.value?.includes(size.value))
          }
          filterOption={(option, input) => {
            const labelMatch = option.label.toLowerCase().includes(input.toLowerCase());
            const groupMatch = option.data.groupLabel?.toLowerCase().includes(input.toLowerCase());
            return labelMatch || groupMatch; // नाम या ग्रुप नाम से सर्च काम करेगा
          }}
        />
      )}
    />
    <FormMessage />
  </FormItem>
  


  );
}
