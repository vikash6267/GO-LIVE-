import { CustomizationOption } from "../../types/product.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProductCustomizationProps {
  options?: CustomizationOption[];
  basePrice?: number;
  onCustomizationChange?: (customizations: { customizations: Record<string, string>, totalPrice: number }) => void;
}

export const ProductCustomization = ({ 
  options, 
  basePrice = 0,
  onCustomizationChange 
}: ProductCustomizationProps) => {
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [customizationEnabled, setCustomizationEnabled] = useState(false);

  if (!options?.length) return null;

  const handleCustomizationChange = (optionLabel: string, value: string) => {
    const newCustomizations = {
      ...customizations,
      [optionLabel]: value
    };
    setCustomizations(newCustomizations);
    
    const totalPrice = customizationEnabled ? basePrice : 0;
    onCustomizationChange?.({ customizations: newCustomizations, totalPrice });
  };

  const handleToggleChange = (checked: boolean) => {
    setCustomizationEnabled(checked);
    const totalPrice = checked ? basePrice : 0;
    onCustomizationChange?.({ customizations, totalPrice });
    console.log(totalPrice)
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customization Options</h3>
        <div className="flex items-center space-x-2">
          <span>Enable Customization</span>
          <Switch 
            checked={customizationEnabled} 
            onCheckedChange={handleToggleChange} 
          />
        </div>
      </div>
      
      {customizationEnabled && basePrice && (
        <Badge variant="secondary">
          +${basePrice.toFixed(2)} per item
        </Badge>
      )}
    </div>
  );
};
