import { CustomizationOption } from "../../types/product.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles, Upload } from "lucide-react";
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
      
      
      </div>
      
      { (
       <div className="bg-gradient-to-r from-green-50 to-green-50 p-4 rounded-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
       <div className="flex items-center gap-2 mb-3">
         <Palette className="w-5 h-5 text-green-500" />
         <h3 className="font-semibold text-green-700">
           Customization Available
         </h3>
       </div>
       <div className="flex items-center justify-between bg-white/80 p-3 rounded-md backdrop-blur-sm">
         <div className="flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-amber-500" />
           <span className="text-gray-700">Custom Design</span>
         </div>
         <div className="flex items-center space-x-2">
          <span>Enable Customization</span>
          <Switch 
            checked={customizationEnabled} 
            onCheckedChange={handleToggleChange} 
          />
        </div>
       </div>

       { customizationEnabled &&
           <Badge
           variant="secondary"
           className="bg-green-100 text-green-700"
         >
Our team will follow up for more details.
         </Badge>
       }
     </div>

     
      )}
    </div>
  );
};
