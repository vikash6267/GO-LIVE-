import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { ProductSpecifications } from "./ProductSpecifications";
import { ProductPricing } from "./ProductPricing";
import { ProductCustomization } from "./ProductCustomization";
import { ProductActions } from "./ProductActions";
import { ProductSizeOptions } from "./ProductSizeOptions";
import { ProductDetails } from "../../types/product.types";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProductDialogProps {
  product: ProductDetails;
  isInCart: boolean;
  quantity: { [key: string]: number };
  onIncreaseQuantity: (id: string) => void; // Add this
  onDecreaseQuantity: (id: string) => void; // Add this
  isAddingToCart: boolean;
  customizations: Record<string, string>;
  onCustomizationChange: (customizations: Record<string, string>) => void;
  onAddToCart: () => void;
  setSelectedSizes: (sizeIds: string[]) => void;
  selectedSizes: string[];
}

export const ProductDialog = ({
  product,
  isInCart,
  isAddingToCart,
  quantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onCustomizationChange,
  onAddToCart,
  setSelectedSizes,
  selectedSizes,
}: ProductDialogProps) => {
  const [imageUrl, setImageUrl] = useState<string>("/placeholder.svg");

  useEffect(() => {
    const loadImage = async () => {
      if (product.images[0] && product.images[0] !== "/placeholder.svg") {
        try {
          // If the image is already a full URL, use it directly
          if (product.images[0].startsWith("http")) {
            setImageUrl(product.images[0]);
            return;
          }

          // Get the public URL from Supabase storage
          const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(product.images[0]);

          if (data?.publicUrl) {
            console.log("Loading image from:", data.publicUrl); // Debug log
            setImageUrl(data.publicUrl);
          }
        } catch (error) {
          console.error("Error loading image:", error);
          setImageUrl("/placeholder.svg");
        }
      }
    };

    loadImage();
  }, [product.images[0]]);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
      </DialogHeader>

      <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Product Image */}
          <div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center p-8 transition-all duration-300 group hover:from-emerald-100 hover:to-emerald-200/50">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>

            {/* Compliance Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["USP 671 Tested", "Child-Resistant"].map((badge) => (
                <Badge
                  key={badge}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Size Options - Now more prominent */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Size(s)</h3>
              <ProductSizeOptions
                quantity={quantity}
                onIncreaseQuantity={onIncreaseQuantity}
                onDecreaseQuantity={onDecreaseQuantity}
                product={product}
                selectedSizes={selectedSizes}
                onSizeSelect={setSelectedSizes}
              />
            </div>

            <Separator />

            {/* Key Features - Compact */}
            {product.specifications?.safetyInfo && (
              <div className="space-y-2">
                <h4 className="text-base font-medium">Key Features:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {product.specifications.safetyInfo
                    .split(".")
                    .filter(Boolean)
                    .map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                        <span className="text-gray-600 text-sm">
                          {feature.trim()}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {product.customization?.allowed && (
              <>
                <Separator />
                <ProductCustomization
                  options={product.customization.options}
                  basePrice={product.customization.basePrice}
                  onCustomizationChange={onCustomizationChange}
                />
              </>
            )}

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing Details</h3>
              <ProductPricing
                basePrice={product.base_price || product.price}
                offer={product.offer}
                tierPricing={product.tierPricing}
              />
            </div>

            <ProductActions
              isInCart={isInCart}
              isAddingToCart={isAddingToCart}
              onAddToCart={onAddToCart}
              disabled={selectedSizes.length === 0}
            />
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};
