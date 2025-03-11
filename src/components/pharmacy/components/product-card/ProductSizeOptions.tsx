import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductDetails } from "../../types/product.types";
import { formatPrice } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProductSizeOptionsProps {
  product: ProductDetails;
  selectedSizes?: string[];
  selectedSizesSKU?: string[];
  onSizeSelect?: (sizeId: string[]) => void;
  onSizeSelectSKU?: (sizeId: string[]) => void;
  quantity: { [key: string]: number };
  onIncreaseQuantity: (id:string) => void; // No sizeId required
  onDecreaseQuantity: (id:string) => void; // No sizeId required
}

export const ProductSizeOptions = ({
  quantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
  product,
  selectedSizes = [],
  onSizeSelect,
  selectedSizesSKU = [],
  onSizeSelectSKU,
}: ProductSizeOptionsProps) => {
  const handleSizeToggle = (sizeId: string) => {
    if (selectedSizes.includes(sizeId)) {
      onSizeSelect?.(selectedSizes.filter((s) => s !== sizeId));
    } else {
      onSizeSelect?.([...selectedSizes, sizeId]);
    }
  };
  const handleSizeToggleSKU = (sizeSKU: string) => {
    if (selectedSizesSKU.includes(sizeSKU)) {
      onSizeSelectSKU?.(selectedSizesSKU.filter((s) => s !== sizeSKU));
    } else {
      onSizeSelectSKU?.([...selectedSizesSKU, sizeSKU]);
    }
  };

  const quantityPerCase = product.quantityPerCase || 0;

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
                <div className="text-sm u text-muted-foreground">
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
       console.log(size)
        const sizeId = `${size.size_value}-${size.size_unit}`;
        const sizeSKU = `${size.sku} - ${size.id}` || "";
        const totalPrice = size.price * quantity[size.id] || size.price; // Using single quantity

        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`size-${index}`}
                checked={selectedSizes.includes(sizeId)}
                onCheckedChange={() => {
                  handleSizeToggle(sizeId);
                  handleSizeToggleSKU(sizeSKU)
                  
                }}
              />
              <Label
                htmlFor={`size-${index}`}
                className="flex-1 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium uppercase">
                      {size.size_value} {size.size_unit}
                    </span>


                    <div className="flex items-center space-x-2">
  {size.originalPrice > 0 && (
    <p className="text-lg font-medium text-red-500 relative discount-price">
      <span className="line-through discount-line">${formatPrice(size.originalPrice)}</span>
    </p>
  )}
  <p className="text-xl font-bold text-green-600 final-price">
    ${formatPrice(totalPrice)}
  </p>
</div>





                  </div>
                  <div className="text-sm text-muted-foreground">
                    {size.quantity_per_case} Units per case
                  </div>
                </div>
              </Label>
            </div>
            {selectedSizes.includes(sizeId) && (
              <div className="flex items-center mt-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={()=>onDecreaseQuantity(size.id)} // Fixed function execution
                  disabled={quantity[size.id] <= 1}
                >
                  -
                </Button>
                <span className="text-lg font-medium">{quantity[size.id] || 1}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={()=>onIncreaseQuantity(size?.id)} // Fixed function execution
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
