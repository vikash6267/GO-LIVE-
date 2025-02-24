import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { Check } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { ProductImage } from "./product-card/ProductImage";
import { ProductPricing } from "./product-card/ProductPricing";
import { ProductDialog } from "./product-card/ProductDialog";
import { ProductDetails } from "../types/product.types";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  product: ProductDetails;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { toast } = useToast();
  const { addToCart, cartItems } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, string>>(
    {}
  );

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const navigate = useNavigate();


  const isInCart = cartItems.some(
    (item) => item.productId === product.id.toString()
  );
  const stockStatus =
    product.stock && product.stock < 10 ? "Low Stock" : "In Stock";

    const handleIncreaseQuantity = (id: string): void => {
      setQuantity((prev) => ({
        ...prev,
        [id]: (prev[id] || 1) + 1, // Increase quantity for specific size
      }));
    };
    
    const handleDecreaseQuantity = (id: string): void => {
      if (quantity[id] > 1) {
        setQuantity((prev) => ({
          ...prev,
          [id]: prev[id] - 1, // Decrease quantity for specific size
        }));
      }
    };
    

    const handleAddToCart = async () => {
      setIsAddingToCart(true);
      console.log(product);
    
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
    
        if (product.stock < 1) {
          throw new Error("Product is out of stock");
        }
    
        const imageUrl =   product.images[0] || product.image_url;
        console.log("Selected Sizes:", selectedSizes);
    
      
        const updatedSizes = product.sizes
          .filter((size) => selectedSizes.includes(`${size.size_value}-${size.size_unit}`)) // ✅ Correct filtering
          .map((size) => ({
            ...size,
            quantity: quantity[size.id] || 1, // ✅ Default 1 if not set
          }))
          .filter((size) => size.quantity > 0); // ✅ Remove sizes with 0 quantity
    
        // ✅ Calculate total price based on sizes
        const totalPrice = updatedSizes.reduce((sum, size) => sum + size.price * size.quantity, 0);
    
        const cartItem = {
          productId: product.id.toString(),
          name: product.name,
          price: totalPrice, // ✅ Corrected price calculation
          image: imageUrl,
          shipping_cost: product.shipping_cost || 0,
          sizes: updatedSizes, // ✅ Updated sizes with correct quantity
          quantity: updatedSizes.reduce((total, size) => total + size.quantity, 0), // ✅ Total quantity sum
          customizations,
          notes: "",
        };
    
        console.log("Cart Item:", cartItem);
    
        const success = await addToCart(cartItem);
    
        if (success) {
          toast({
            title: "Added to Cart",
            description: (
              <Alert className="border-emerald-500 bg-emerald-50">
                <Check className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="ml-2">
                  {product.name} has been added to your cart successfully!
                </AlertDescription>
              </Alert>
            ),
          });
        } else {
          throw new Error("Failed to add to cart");
        }
      } catch (error: any) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAddingToCart(false);
      }
    };
    
    

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <ProductImage
              image={ product.images[0] || product.image }
              name={product.name}
              offer={product.offer}
              stockStatus={stockStatus}
            />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>

              {/* <ProductPricing
                basePrice={product.base_price || product.price}
                offer={product.offer}
                tierPricing={product.tierPricing}
              /> */}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <ProductDialog
        product={product}
        isInCart={isInCart}
        isAddingToCart={isAddingToCart}
        customizations={customizations}
        onCustomizationChange={setCustomizations}
        onAddToCart={handleAddToCart}
        quantity={quantity}
        onIncreaseQuantity={handleIncreaseQuantity} // Pass increase function
        onDecreaseQuantity={handleDecreaseQuantity} // Pass decrease function
        setSelectedSizes={setSelectedSizes}
        selectedSizes={selectedSizes}
      />
    </Dialog>
  );
};

export default ProductCard;