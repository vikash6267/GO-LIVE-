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
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper components

interface ProductDialogProps {
  product: ProductDetails;
  isInCart: boolean;
  quantity: { [key: string]: number };
  onIncreaseQuantity: (id: string) => void;
  onDecreaseQuantity: (id: string) => void;
  isAddingToCart: boolean;
  customizations: Record<string, string>;
  onCustomizationChange: (customizations: Record<string, string>) => void;
  onAddToCart: () => void;
  setSelectedSizes: (sizeIds: string[]) => void;
  setSelectedSizesSKU: (sizeIds: string[]) => void;
  selectedSizes: string[];
  selectedSizesSKU: string[];
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
  selectedSizesSKU,
  setSelectedSizesSKU,
}: ProductDialogProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  console.log(selectedSizesSKU);
  useEffect(() => {
    const loadImages = async () => {
      const loadedUrls: string[] = [];

      for (const image of product.images) {
        try {
          if (image.startsWith("http")) {
            loadedUrls.push(image); // If image is already a full URL, add directly
          } else {
            // Get public URL from Supabase storage
            const { data } = supabase.storage
              .from("product-images")
              .getPublicUrl(image);
            if (data?.publicUrl) {
              loadedUrls.push(data.publicUrl);
            }
          }
        } catch (error) {
          console.error("Error loading image:", error);
          loadedUrls.push("/placeholder.svg"); // Fallback to placeholder
        }
      }

      setImageUrls(loadedUrls);
    };

    loadImages();
  }, [product.images]);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
      </DialogHeader>

      <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Product Image Carousel */}
          <div>
            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
            >
              {imageUrls.map((url, index) => (
                <SwiperSlide key={index}>
                  <div className="aspect-square rounded-xl bg-gradient-to-br bg-gray-400 to-emerald-100/50 flex items-center justify-center p-8 transition-all duration-300 group hover:bg-gray-500 hover:to-emerald-200/50">
                    <img
                      src={url}
                      alt={product.name}
                      className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Compliance Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {product.key_features?.split(",").map((feature) => (
                <Badge
                  key={feature.trim()}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {feature.trim()}
                </Badge>
              ))}
            </div>
            <br />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold block mb-1">SKU:</span>
                <p className="text-gray-600">{product?.sku}</p>
                {selectedSizesSKU.map((size) => size.split(" ")[0])}
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold block mb-1">Category:</span>
                <p className="text-gray-600">{product.category}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Size Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Size(s)</h3>
              <ProductSizeOptions
                quantity={quantity}
                onIncreaseQuantity={onIncreaseQuantity}
                onDecreaseQuantity={onDecreaseQuantity}
                product={product}
                selectedSizes={selectedSizes}
                onSizeSelect={setSelectedSizes}
                selectedSizesSKU={selectedSizesSKU}
                onSizeSelectSKU={setSelectedSizesSKU}
              />
            </div>

            {/* Key Features */}
            {/* {product.specifications?.safetyInfo && (
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
            )} */}

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

            <ProductActions
              isInCart={isInCart}
              isAddingToCart={isAddingToCart}
              onAddToCart={onAddToCart}
              selectedSizesSKU={selectedSizesSKU}
              disabled={selectedSizes.length === 0}
            />
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};
