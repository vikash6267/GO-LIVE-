import { useState, useEffect, useMemo } from "react";
import { HeroSection } from "./components/HeroSection";
import { CartDrawer } from "./components/CartDrawer";
import { SearchFilters } from "./components/product-showcase/SearchFilters";
import { ProductGrid } from "./components/product-showcase/ProductGrid";
import { filterProducts } from "./utils/productFilters";
import { supabase } from "@/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "./types/product.types";
import { selectUserProfile } from "@/store/selectors/userSelectors";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const ProductShowcase = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const userProfile = useSelector(selectUserProfile);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const userType = sessionStorage.getItem('userType');

      // Fetch Group Pricing Data
      const { data: groupData, error: fetchError } = await supabase
        .from("group_pricing")
        .select("*");

      if (fetchError) {
        console.error("Error fetching group pricing:", fetchError.message);
        return;
      }

      console.log("Fetched Group Data:", groupData);

      // Fetch Products with Sizes
      try {
        const { data: productsData, error } = await supabase
          .from("products")
          .select("*, product_sizes(*)");

        if (error) {
          throw error;
        }

        console.log("Fetched Products:", productsData);






        let ID = userProfile?.id;
        try {
          if (userType.toLocaleLowerCase() === "pharmacy") {


            const { data, error } = await supabase
              .from("profiles")
              .select(
                "id,first_name, group_id "
              )
              .eq("id", userProfile?.id)
              .single(); // Fetch only one record for simplicity

            if (error) {
              console.error("Failed to fetch customer information:", error);
              throw new Error(
                "Failed to fetch customer information: " + error.message
              );
            }

            if (!data || data.length === 0) {
              throw new Error("No customer information found.");
            }
            console.log("Data", data);
            ID = data?.group_id || userProfile?.id
          }
        } catch (error) {
          console.log(error)
        }


        // Map and Apply Discount
        const mappedProducts: ProductDetails[] = productsData.map((item) => {
          // Find applicable group pricing for this product
          if (userType.toLocaleLowerCase() === "group") {

          }
          const applicableGroup = groupData.find(
            (group) =>
              group.group_ids.includes(ID) &&
              group.product_id_array.includes(item.id)
          );
          console.log(applicableGroup)

          return {
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: item.base_price || 0,
            base_price: item.base_price || 0,
            category: item.category || "",
            shipping_cost: item.shipping_cost || "",
            stock: item.current_stock || 0,
            minOrder: item.min_stock || 0,
            images: item.images,
            image: item.image_url || item.image || "/placeholder.svg",
            image_url: item.image_url || item.image || "/placeholder.svg",
            offer: "",
            endsIn: "",
            sku: item.sku,
            customization: {
              allowed: item.customization?.allowed || false,
              options: item.customization?.options || [],
              basePrice: item.customization?.price || 0,
            },
            key_features: item.key_features,
            productId: item.id.toString(),
            specifications: {
              safetyInfo: item.description || "",
            },
            quantityPerCase: item.quantity_per_case || 0,
            sizes:
              item.product_sizes?.map((size) => {
                let newPrice = size.price;

                // Apply Discount if applicable
                if (applicableGroup) {
                  if (applicableGroup.discount_type === "percentage") {
                    newPrice = newPrice - (newPrice * applicableGroup.discount) / 100;
                  } else if (applicableGroup.discount_type === "fixed") {
                    newPrice = Math.max(0, newPrice - applicableGroup.discount); // Prevent negative price
                  }
                }

                return {
                  id: size.id,
                  size_value: size.size_value,
                  size_unit: size.size_unit,
                  price: newPrice,
                  sku: size.sku || "",
                  key_features: size.key_features || "",
                  quantity_per_case: size.quantity_per_case,
                  pricePerCase: size.price_per_case,
                  price_per_case: size.price_per_case,
                  stock: size.stock,
                  image: size.image || "",
                };
              }) || [],
            tierPricing: item.enable_tier_pricing
              ? {
                tier1: { quantity: item.tier1_name || "", price: item.tier1_price || 0 },
                tier2: { quantity: item.tier2_name || "", price: item.tier2_price || 0 },
                tier3: { quantity: item.tier3_name || "", price: item.tier3_price || 0 },
              }
              : undefined,
          };
        });

        console.log("Mapped Products with Discounts:", mappedProducts);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
      }
    };


    fetchProducts();
  }, [userProfile]);

  const filteredProducts = useMemo(
    () => filterProducts(products, searchQuery, selectedCategory, priceRange),
    [products, searchQuery, selectedCategory, priceRange]
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <HeroSection />
        {/* <CartDrawer /> */}
      </div>

      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />
{
  products.length > 0 ? (
    <ProductGrid products={filteredProducts} />
  ) : (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="animate-spin text-gray-500" size={32} />
    </div>
  )
}
    </div>
  );
};

export default ProductShowcase;
