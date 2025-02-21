
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductDetails } from "../../types/product.types";
import { formatPrice } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProductSizeOptionsProps {
  product: ProductDetails;
  selectedSizes?: string[];
  onSizeSelect?: (sizeId: string[]) => void;
}

export const ProductSizeOptions = ({ 
  product, 
  selectedSizes = [],
  onSizeSelect 
}: ProductSizeOptionsProps) => {
  const handleSizeToggle = (sizeId: string) => {
    const newSelectedSizes = selectedSizes.includes(sizeId)
      ? selectedSizes.filter(s => s !== sizeId)
      : [...selectedSizes, sizeId];
    onSizeSelect?.(newSelectedSizes);
  };

  const quantityPerCase = product.quantityPerCase || 0;

  // If no sizes are defined, show base price option
  if (!product.sizes || product.sizes.length === 0) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="standard"
            checked={selectedSizes.includes('standard')}
            onCheckedChange={() => handleSizeToggle('standard')}
          />
          <Label htmlFor="standard">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">Standard Size</span>
                <div className="text-emerald-600 font-semibold">
                  ${formatPrice(product.base_price)}
                </div>
              </div>
              {quantityPerCase > 0 && (
                <div className="text-sm text-muted-foreground">
                  {quantityPerCase} units per case
                </div>
              )}
            </div>
          </Label>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {product.sizes.map((size, index) => (
        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id={`size-${index}`}
              checked={selectedSizes.includes(`${size.size_value}-${size.size_unit}`)}
              onCheckedChange={() => handleSizeToggle(`${size.size_value}-${size.size_unit}`)}
            />
            <Label htmlFor={`size-${index}`} className="flex-1 cursor-pointer">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{size.size_value} {size.size_unit}</span>
                  <div className="text-emerald-600 font-semibold">
                    ${formatPrice(size.price)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {quantityPerCase} units per case
                </div>
              </div>
            </Label>
          </div>
        </Card>
      ))}
    </div>
  );
};
