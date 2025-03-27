
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
import { supabase } from "@/integrations/supabase/client";
import Swal from "sweetalert2";

export const SizeOptionsField = ({ form,isEditing }: SizeOptionsFieldProps) => {
  const category = form.watch("category");
  const categoryConfig = CATEGORY_CONFIGS[category as keyof typeof CATEGORY_CONFIGS] || CATEGORY_CONFIGS.OTHER;

  const [newSize, setNewSize] = useState<NewSizeState>({
    size_value: "",
    size_unit: categoryConfig.defaultUnit,
    price: "",
    sku: "",
    pricePerCase: "",
    stock: "",
    price_per_case:'',
    quantity_per_case: "100",
    rolls_per_case: "",
    shipping_cost: "0",
    image:"",
    sizeSquanence:''
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
    let PPC = (parseFloat(newSize.price) / parseFloat(newSize.quantity_per_case || "1")).toFixed(2);

    const sizeToAdd = {
      size_value: newSize.size_value,
      sku: newSize.sku || "",
      sizeSquanence: newSize.sizeSquanence || "",
      image:newSize.image || "",
      size_unit: newSize.size_unit || categoryConfig.defaultUnit,
      price: parseFloat(newSize.price) || 0,
      stock: parseInt(newSize.stock) || 0,
      quantity_per_case: parseFloat(newSize.quantity_per_case) || 0,
      pricePerCase: parseFloat(newSize.price_per_case) || 0,
      price_per_case:parseFloat(PPC) || 0,
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
      sku: "",
      pricePerCase: "",
      price_per_case:"",
      stock: "",
      quantity_per_case: "",
      rolls_per_case: "",
      sizeSquanence:'',
      shipping_cost: "0",
      image:""
    });

    toast({
      title: "Size Added",
      description: "New size variation has been added successfully."
    });
  };

  const handleRemoveSize = async (index: number) => {
    const currentSizes = form.getValues("sizes") || [];
    const newSizes = [...currentSizes];
  
    // Extract the size being removed
    const removedSize = newSizes[index];
  
    // Remove the size from the array
    newSizes.splice(index, 1);
    form.setValue("sizes", newSizes, { 
      shouldValidate: true,
      shouldDirty: true 
    });
 
    if (isEditing && removedSize?.id) {
      // Delete from Supabase only if the size has an ID
      const { error: deleteError } = await supabase
        .from("product_sizes")
        .delete()
        .eq("id", removedSize.id);
  
      if (deleteError) {
        console.error("Error removing size:", deleteError);
        toast({
          title: "Error",
          description: "Failed to remove size.",
         
        });
        return;
      }
    }
  
    toast({
      title: "Size Removed",
      description: "Size variation has been removed."
    });
  };
  

  const handleUpdateSize = (index: number, field: string, value: string | number) => {
    const currentSizes = form.getValues("sizes") || [];
    const updatedSizes = [...currentSizes];
 
    if (field === "price" || field === "quantity_per_case") {
      let newPrice = field === "price" ? parseFloat(value as string) : updatedSizes[index].price;
      let newQuantity = field === "quantity_per_case" ? parseFloat(value as string) : updatedSizes[index].quantity_per_case;
      
      let PPC = newQuantity > 0 ? (newPrice / newQuantity).toFixed(2) : "0.00";
    
      updatedSizes[index] = {
        ...updatedSizes[index],
        price_per_case: Number(PPC),
      };
    }
    
    // Ensure value is correctly converted
    const parsedValue =
      typeof value === "string" && field !== "size_value" && field !== "size_unit" && field !== "sku" && field !== "image"
        ? parseFloat(value) || 0
        : value;
  
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: parsedValue, // Ensure stock updates properly
    };
  
    form.setValue("sizes", updatedSizes, {
      shouldValidate: true,
      shouldDirty: true,
    });
  
    form.trigger("sizes"); // Force validation and re-render
  };
  

  return (
    <div className="space-y-6">
      <AddSizeForm
        newSize={newSize}
        onSizeChange={setNewSize}
        onAddSize={handleAddSize}
        category={category}
        setNewSize={setNewSize}
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
                sizeSquanence:size.sizeSquanence ||0,
                size_unit: size.size_unit || categoryConfig.defaultUnit,
                price: size.price || 0,
                quantity_per_case : size?.quantity_per_case || 0,
                stock: size.stock || 0,
              }))}
              onRemoveSize={handleRemoveSize}
              onUpdateSize={handleUpdateSize}
              category={category}
        setNewSize={setNewSize}

            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
