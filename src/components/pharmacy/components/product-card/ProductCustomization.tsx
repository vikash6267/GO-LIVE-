import { CustomizationOption } from "../../types/product.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ProductCustomizationProps {
  options?: CustomizationOption[];
  basePrice?: number;
  onCustomizationChange?: (customizations: Record<string, string>) => void;
}

export const ProductCustomization = ({ 
  options, 
  basePrice,
  onCustomizationChange 
}: ProductCustomizationProps) => {
  const [customizations, setCustomizations] = useState<Record<string, string>>({});

  if (!options?.length) return null;

  const handleCustomizationChange = (optionLabel: string, value: string) => {
    const newCustomizations = {
      ...customizations,
      [optionLabel]: value
    };
    setCustomizations(newCustomizations);
    onCustomizationChange?.(newCustomizations);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customization Options</h3>
        {basePrice && (
          <Badge variant="secondary">
            +${basePrice.toFixed(2)} per item
          </Badge>
        )}
      </div>
      
    
    </div>
  );
};