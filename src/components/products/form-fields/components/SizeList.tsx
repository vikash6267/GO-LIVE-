import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { CATEGORY_CONFIGS } from "../../schemas/productSchema";
import { SizeImageUploader } from "../SizeImageUploader";

interface Size {
  size_value: string;
  size_unit: string;
  price: number;
  sku?: any;

  pricePerCase?: any;
  price_per_case?: number;
  stock: number;
  quantity_per_case: number;
  rolls_per_case?: number;
  sizeSquanence?: number;
  shipping_cost?: number;
}

interface SizeListProps {
  sizes: Size[];
  onRemoveSize: (index: number) => void;
  setNewSize: (boolean) => void;
  onUpdateSize: (index: number, field: string, value: string | number) => void;
  category: string;
}

export const SizeList = ({
  sizes = [],
  onRemoveSize,
  onUpdateSize,
  category,
  setNewSize
}: SizeListProps) => {
  const categoryConfig =
    CATEGORY_CONFIGS[category as keyof typeof CATEGORY_CONFIGS] ||
    CATEGORY_CONFIGS.OTHER;



  console.log(categoryConfig)
  console.log(sizes)
  return (
    <div className="space-y-2">
      {sizes.map((size, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10"
        >
          <div className="grid grid-cols-6 gap-6 flex-1">
            <div>
              <span className="text-sm font-medium">Size</span>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={size.size_value}
                  onChange={(e) =>
                    onUpdateSize(index, "size_value", e.target.value)
                  }
                  className="h-8"
                />
                <span className="text-sm">{size.size_unit}</span>
              </div>
            </div>
            {categoryConfig.hasRolls && (
              <div>
                <span className="text-sm font-medium">Rolls/CS</span>
                <Input
                  type="number"
                  value={size.rolls_per_case || 0}
                  onChange={(e) =>
                    onUpdateSize(index, "rolls_per_case", e.target.value)
                  }
                  className="h-8"
                  min="0"
                />
              </div>
            )}
            <div>
              <span className="text-sm font-medium">SKU</span>
              <Input
                type="text"
                value={size.sku || ""}
                onChange={(e) =>
                  onUpdateSize(index, "sku", e.target.value)
                }
                className="h-8"

              />
            </div>
            <div>
              <span className="text-sm font-medium">$/Unit</span>
              <Input
                type="number"
                value={size.price_per_case || 0}
                onChange={(e) =>
                  onUpdateSize(index, "price_per_case", e.target.value)
                }
                className="h-8"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <span className="text-sm font-medium">$/CS</span>
              <Input
                type="number"
                value={size.price}
                onChange={(e) => onUpdateSize(index, "price", e.target.value)}
                className="h-8"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <span className="text-sm font-medium">Shipping/CS</span>
              <Input
                type="number"
                value={size.shipping_cost}
                onChange={(e) =>
                  onUpdateSize(index, "shipping_cost", e.target.value)
                }
                className="h-8"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <span className="text-sm font-medium">Q.Per Case</span>
              <Input
                type="number"
                value={size.quantity_per_case || 15}
                onChange={(e) =>
                  onUpdateSize(index, "quantity_per_case", e.target.value)
                }
                className="h-8"
                min="0"
                step="1"
              />
            </div>
            <div>
              <span className="text-sm font-medium">Stock</span>
              <Input
                type="number"
                value={size.stock}
                onChange={(e) =>
                  onUpdateSize(index, "stock", parseInt(e.target.value) || 0)
                }
                className="h-8"
                min="0"
              />
            </div>
            <div>
              <span className="text-sm font-medium">Size Squanence</span>
              <Input
                type="number"
                value={size.sizeSquanence}
                onChange={(e) =>
                  onUpdateSize(index, "sizeSquanence", parseInt(e.target.value) || 0)
                }
                className="h-8"
                min="0"
              />
            </div>


            <SizeImageUploader
              form={size}
              indexValue={index}
              onUpdateSize={onUpdateSize}
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
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveSize(index)}
            className="ml-4 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
