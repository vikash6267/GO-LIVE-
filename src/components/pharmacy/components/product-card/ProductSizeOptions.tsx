import { useState } from "react";
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
  onSizeSelect,
}: ProductSizeOptionsProps) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleSizeToggle = (sizeId: string) => {
    if (selectedSizes.includes(sizeId)) {
      onSizeSelect?.(selectedSizes.filter((s) => s !== sizeId));
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[sizeId]; // Remove quantity when unselected
        return updated;
      });
    } else {
      onSizeSelect?.([...selectedSizes, sizeId]);
      setQuantities((prev) => ({ ...prev, [sizeId]: 1 })); // Default quantity 1 on select
    }
  };

  const handleQuantityChange = (sizeId: string, change: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(1, (prev[sizeId] || 1) + change); // Ensure min 1
      return { ...prev, [sizeId]: newQuantity };
    });
  };

  const quantityPerCase = product.quantityPerCase || 0;

  // If no sizes are defined, show base price option
  if (!product.sizes || product.sizes.length === 0) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="standard"
            checked={selectedSizes.includes("standard")}
            onCheckedChange={() => handleSizeToggle("standard")}
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
      {product.sizes.map((size, index) => {
        const sizeId = `${size.size_value}-${size.size_unit}`;
        const quantity = quantities[sizeId] || 1;
        const totalPrice = size.price * quantity;

        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`size-${index}`}
                checked={selectedSizes.includes(sizeId)}
                onCheckedChange={() => handleSizeToggle(sizeId)}
              />
              <Label
                htmlFor={`size-${index}`}
                className="flex-1 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {size.size_value} {size.size_unit}
                    </span>
                    <div className="text-emerald-600 font-semibold">
                      ${formatPrice(totalPrice)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quantityPerCase} units per case
                  </div>
                </div>
              </Label>
            </div>
            {selectedSizes.includes(sizeId) && (
              <div className="flex items-center mt-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(sizeId, -1)}
                >
                  -
                </Button>
                <span className="text-lg font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(sizeId, 1)}
                >
                  +
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
