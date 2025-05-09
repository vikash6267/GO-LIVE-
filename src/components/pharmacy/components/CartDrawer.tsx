import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();


  const shipingCost =
  sessionStorage.getItem("shipping") == "true"
    ? 0
    : Math.max(...cartItems.map((item) => item.shipping_cost || 0));

  const total = cartItems.reduce((sum, item) => {
    // ✅ Har size ki price * quantity ka sum calculate karega
    const itemTotal = item.sizes.reduce(
      (sizeSum, size) => sizeSum + size.price * size.quantity,
      0
    );
    const shipp = sessionStorage.getItem("shipping") == "true" ? 0 : shipingCost
    return sum + itemTotal + shipp ;

  }, 0);

  useEffect(() => {
    console.log(cartItems);
  }, []);

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number,
    sizeId: string
  ) => {
    const success = await updateQuantity(productId, newQuantity, sizeId);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const success = await removeFromCart(productId);
    if (success) {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Format cart items for order
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || "",
        shipping_cost: item.shipping_cost,
      }));
      // Store order items in localStorage for the order page
      localStorage.setItem("pendingOrderItems", JSON.stringify(orderItems));

      // Close the drawer
      setIsOpen(false);


      const userType = sessionStorage.getItem('userType');

      if(userType.toLocaleLowerCase() === 'group'){
        navigate("/group/order");

      }
      if(userType.toLocaleLowerCase() === 'pharmacy'){
        navigate("/pharmacy/order");

      }
      if (userType.toLowerCase() === "admin") {
        navigate("/admin/orders", { state: { createOrder: true } });
      }
      
      // Navigate to order page
      
      // window.location.reload();

    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[90vh] ">
          <ScrollArea className="flex-1 -mx-6 px-6 ">
            {cartItems.length === 0 ? (
              <div className="flex flex-col o items-center justify-center h-[50vh] text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">
                  Your cart is empty
                </p>
                <p className="text-sm text-gray-500">
                  Add items to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={`https://cfyqeilfmodrbiamqgme.supabase.co/storage/v1/object/public/product-images/${item.image}`}
                      alt={`${item.name}`}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500"></p>
                      <div>
                        {item.sizes
                          .filter((size) => size.quantity > 0) // ✅ Sirf non-zero quantity wale sizes dikhaye
                          .map((size) => (
                            <div
                              key={size.id}
                              className="border p-2 mb-2 rounded"
                            >
                              <p>
                                <strong>Size:</strong> {size.size_value}{" "}
                                {size.size_unit}
                              </p>
                              <p>
                                <strong>Price per Case:</strong>$
                                {size.price.toFixed(2)}
                              </p>
                              <p>
                                <strong>Total Price:</strong>$
                                {(size.quantity * size.price).toFixed(2)}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.productId,
                                      (item.sizes.find((s) => s.id === size.id)
                                        ?.quantity || 0) - 1, // Default 0 if size not found

                                      size.id
                                    )
                                  }
                                  disabled={
                                    (item.sizes.find((s) => s.id === size.id)
                                      ?.quantity || 0) <= 1
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">
                                  {item.sizes.find((s) => s.id === size.id)
                                    ?.quantity || "N/A"}
                                </span>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.productId,
                                      (item.sizes.find((s) => s.id === size.id)
                                        ?.quantity || 0) + 1, // Default 0 if size not found
                                      size.id
                                    )
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {cartItems.length > 0 && (
            <div className="border-t mt-6 pt-6 space-y-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Shipping Cost</span>
                <span>
                  {sessionStorage.getItem("shipping") == "true"
                    ? "Free"
                    :`$${shipingCost}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Proceed to Order"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
