
import {
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ProductFormValues, CATEGORY_CONFIGS } from "../schemas/productSchema";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AddSizeForm } from "./components/AddSizeForm";
import { SizeList } from "./components/SizeList";
import { SizeOptionsFieldProps, NewSizeState } from "../types/size.types";

export const SizeOptionsField = ({ form }: SizeOptionsFieldProps) => {
  const category = form.watch("category");
  const categoryConfig = CATEGORY_CONFIGS[category as keyof typeof CATEGORY_CONFIGS] || CATEGORY_CONFIGS.OTHER;

  const [newSize, setNewSize] = useState<NewSizeState>({
    size_value: "",
    size_unit: categoryConfig.defaultUnit,
    price: "",
    pricePerCase: "",
    stock: "",
    rolls_per_case: "",
    shipping_cost: "15"
  });

  const handleAddSize = () => {
    if (!newSize.size_value || !newSize.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required size fields",
        variant: "destructive"
      });
      return;
    }

    const currentSizes = form.getValues("sizes") || [];

    const sizeToAdd = {
      size_value: newSize.size_value,
      size_unit: newSize.size_unit || categoryConfig.defaultUnit,
      price: parseFloat(newSize.price) || 0,
      stock: parseInt(newSize.stock) || 0,
      pricePerCase: parseFloat(newSize.pricePerCase) || 0,
      rolls_per_case: parseInt(newSize.rolls_per_case) || 0,
      shipping_cost: parseFloat(newSize.shipping_cost) || 15
    } as const;

    if (!sizeToAdd.size_value || !sizeToAdd.size_unit) {
      toast({
        title: "Validation Error",
        description: "Size value and unit are required",
        variant: "destructive"
      });
      return;
    }

    form.setValue("sizes", [...currentSizes, sizeToAdd], { 
      shouldValidate: true,
      shouldDirty: true 
    });

    setNewSize({
      size_value: "",
      size_unit: categoryConfig.defaultUnit,
      price: "",
      pricePerCase: "",
      stock: "",
      rolls_per_case: "",
      shipping_cost: "15"
    });

    toast({
      title: "Size Added",
      description: "New size variation has been added successfully."
    });
  };

  const handleRemoveSize = (index: number) => {
    const currentSizes = form.getValues("sizes") || [];
    const newSizes = [...currentSizes];
    newSizes.splice(index, 1);
    form.setValue("sizes", newSizes, { 
      shouldValidate: true,
      shouldDirty: true 
    });
    
    toast({
      title: "Size Removed",
      description: "Size variation has been removed."
    });
  };

  const handleUpdateSize = (index: number, field: string, value: string | number) => {
    const currentSizes = form.getValues("sizes") || [];
    const updatedSizes = [...currentSizes];
    
    const updatedSize = {
      ...updatedSizes[index],
      [field]: typeof value === 'string' && field !== 'size_value' && field !== 'size_unit' 
        ? parseFloat(value) || 0 
        : value || (field === 'size_unit' ? categoryConfig.defaultUnit : ''),
      size_value: updatedSizes[index].size_value || '',
      size_unit: updatedSizes[index].size_unit || categoryConfig.defaultUnit,
      price: updatedSizes[index].price || 0,
      stock: updatedSizes[index].stock || 0
    };

    updatedSizes[index] = updatedSize;
    
    form.setValue("sizes", updatedSizes, { 
      shouldValidate: true,
      shouldDirty: true 
    });
  };

  return (
    <div className="space-y-6">
      <AddSizeForm
        newSize={newSize}
        onSizeChange={setNewSize}
        onAddSize={handleAddSize}
        category={category}
      />

      <FormField
        control={form.control}
        name="sizes"
        render={({ field }) => (
          <FormItem>
            <SizeList
              sizes={(field.value || []).map(size => ({
                ...size,
                size_value: size.size_value || '',
                size_unit: size.size_unit || categoryConfig.defaultUnit,
                price: size.price || 0,
                stock: size.stock || 0,
              }))}
              onRemoveSize={handleRemoveSize}
              onUpdateSize={handleUpdateSize}
              category={category}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
