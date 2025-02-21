
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/types/product";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "../schemas/productSchema";
import { Button } from "@/components/ui/button";
import { Bold, Check, Pencil, Type, X } from "lucide-react";
import { useState } from "react";

interface BasicInfoSectionProps {
  form: UseFormReturn<ProductFormValues>;
  generateSKU: (category: string) => string;
}

export const BasicInfoSection = ({ form, generateSKU }: BasicInfoSectionProps) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(form.getValues("description") || "");
  const [isBold, setIsBold] = useState(false);
  const [fontSize, setFontSize] = useState("base");

  const handleDescriptionEdit = () => {
    setTempDescription(form.getValues("description") || "");
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = () => {
    form.setValue("description", tempDescription);
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setTempDescription(form.getValues("description") || "");
    setIsEditingDescription(false);
  };

  const toggleBold = () => {
    setIsBold(!isBold);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("name", value);

                  if (!form.getValues("sku")) {
                    form.setValue("sku", generateSKU(value));
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <FormControl>
              <Input placeholder="Auto-generated SKU" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Description
              {!isEditingDescription && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDescriptionEdit}
                  className="h-8 px-2 text-gray-500 hover:text-gray-700"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </FormLabel>
            <div className="relative">
              {isEditingDescription && (
                <div className="absolute -top-10 left-0 flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleBold}
                    className={`h-8 w-8 p-0 ${isBold ? 'bg-gray-100' : ''}`}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Select
                    value={fontSize}
                    onValueChange={handleFontSizeChange}
                  >
                    <SelectTrigger className="w-[110px] h-8">
                      <Type className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="base">Normal</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <FormControl>
                <Input
                  placeholder="Product Description"
                  value={isEditingDescription ? tempDescription : field.value}
                  onChange={isEditingDescription ? (e) => setTempDescription(e.target.value) : field.onChange}
                  className={`pr-20 text-${fontSize} ${isBold ? 'font-bold' : 'font-medium'} ${isEditingDescription ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  disabled={!isEditingDescription}
                />
              </FormControl>
              {isEditingDescription && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDescriptionSave}
                    className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDescriptionCancel}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
