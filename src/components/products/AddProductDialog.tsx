import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormValues, productFormSchema } from "./schemas/productSchema";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { ImageUploadField } from "./form-fields/ImageUploadField";
import { SizeOptionsField } from "./form-fields/SizeOptionsField";
import { InventorySection } from "./form-sections/InventorySection";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { CustomizationSection } from "./form-fields/Customizations";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onProductAdded: () => void;
  initialData?: Partial<ProductFormValues>;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  onProductAdded,
  initialData,
}: AddProductDialogProps) {
  console.log(initialData)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      key_features: initialData?.key_features || "",
  squanence:initialData?.squanence || "",

      description: initialData?.description || "",
      category: initialData?.category || "",
      images: initialData?.images || [],
      sizes: initialData?.sizes || [],
      base_price: initialData?.base_price || 0,
      current_stock: initialData?.current_stock || 0,
      min_stock: initialData?.min_stock || 0,
      reorder_point: initialData?.reorder_point || 0,
      quantityPerCase: initialData?.quantityPerCase || 1,
      customization: initialData?.customization || {
        allowed: false,
        options: [],
        price: 0,
      },
      trackInventory: initialData?.trackInventory ?? true,
      image_url: initialData?.image_url || "",
    },
  });


  

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await onSubmit(values);
      form.reset();
      onProductAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <BasicInfoSection
              form={form}
              generateSKU={(category) => {
                const timestamp = Date.now().toString().slice(-4);
                const prefix = category.slice(0, 3).toUpperCase();
                return `${prefix}-${timestamp}`;
              }}
            />
            <ImageUploadField
              form={form}
              validateImage={(file) => {
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                  return "Image size should be less than 5MB";
                }
                const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
                if (!allowedTypes.includes(file.type)) {
                  return "Only JPG, PNG and GIF images are allowed";
                }
                return null;
              }}
            />
            <SizeOptionsField form={form} />
            <CustomizationSection form={form} />
            <InventorySection form={form} />
            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>
                      {initialData ? "Updating" : "Adding"} Product...
                    </span>
                  </>
                ) : initialData ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
