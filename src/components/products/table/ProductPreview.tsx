import { Product, ProductSize } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Palette, Sparkles } from "lucide-react";

interface ProductPreviewProps {
  product: Product;
}

export const ProductPreview = ({ product }: ProductPreviewProps) => {
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
  }, [product.image_url]);

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-300 to-gray-500/50  hover:from-gray-700 hover:to-gray-900/50 flex items-center justify-center p-8 transition-all duration-300 group ">
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
               <div className=" my-3">
            <h2 className="text-2xl font-bold leading-tight mb-3">
              {product.name}
            </h2>
            <p className="text-gray-600 leading-relaxed tracking-wide max-w-prose">
              {product.description}
            </p>
          </div>
          </div>
        </div>

        <div className="space-y-6">
       

          <Separator className="mb-4" />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold block mb-1">SKU:</span>
                <p className="text-gray-600">{product.sku}</p>
                {/* {selectedSizesSKU?.map((size)=>{
                  size.slice()
                })} */}
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold block mb-1">Category:</span>
                <p className="text-gray-600">{product.category}</p>
              </div>
            </div>

            {/* <div className="bg-emerald-50 p-3 rounded-lg">
              <span className="font-semibold block mb-1">Base Price:</span>
              <p className="text-emerald-600 font-semibold">
                ${formatPrice(product.base_price)}
              </p>
            </div> */}

            {product.customization?.allowed && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-purple-700">
                    Customization Available
                  </h3>
                </div>
                <div className="flex items-center justify-between bg-white/80 p-3 rounded-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-700">Custom Design</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700"
                  >
                    +${formatPrice(product.customization?.price || 0)} per unit
                  </Badge>
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold mb-2">Available Sizes:</h3>
                <div className="space-y-2">
                  {product.sizes.map((size: ProductSize, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {size.size_value} {size.size_unit}
                        </span>
                        <span className="text-sm text-gray-500">
                          {size.quantity_per_case} units per case
                        </span>
                      </div>
                      <span className="font-medium text-emerald-600">
                        ${formatPrice(size.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

           
          </div>
        </div>
      </div>
    </DialogContent>
  );
};
