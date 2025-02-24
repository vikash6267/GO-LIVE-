
import { useState, useEffect, useMemo } from "react";
import { HeroSection } from "./components/HeroSection";
import { CartDrawer } from "./components/CartDrawer";
import { SearchFilters } from "./components/product-showcase/SearchFilters";
import { ProductGrid } from "./components/product-showcase/ProductGrid";
import { filterProducts } from "./utils/productFilters";
import { supabase } from "@/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "./types/product.types";

const ProductShowcase = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: productsData, error } = await supabase
          .from("products")
          .select("*, product_sizes(*)");

        if (error) {
          throw error;
        }

        console.log(productsData)
        // Map Supabase data to match ProductDetails
        const mappedProducts: ProductDetails[] = productsData.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: item.base_price || 0,
          base_price: item.base_price || 0,
          category: item.category || "",
          shipping_cost: item.shipping_cost || "",
          stock: item.current_stock || 0,
          minOrder: item.min_stock || 0,
          images: item.images ,
          image: item.image_url || item.image || '/placeholder.svg',
          image_url: item.image_url || item.image || '/placeholder.svg',
          offer: "",
          endsIn: "",
          productId: item.id.toString(),
          specifications: {
            safetyInfo: item.description || "",
          },
          quantityPerCase: item.quantity_per_case || 0,
          sizes: item.product_sizes?.map((size: any) => ({
            id:size.id,
            size_value: size.size_value,
            size_unit: size.size_unit,
            price: size.price,
            pricePerCase: size.price_per_case,
            stock: size.stock
          })) || [],
          tierPricing: item.enable_tier_pricing ? {
            tier1: { quantity: item.tier1_name || "", price: item.tier1_price || 0 },
            tier2: { quantity: item.tier2_name || "", price: item.tier2_price || 0 },
            tier3: { quantity: item.tier3_name || "", price: item.tier3_price || 0 },
          } : undefined
        }));

        console.log("Mapped Products:", mappedProducts);
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
  }, []);

  const filteredProducts = useMemo(
    () => filterProducts(products, searchQuery, selectedCategory, priceRange),
    [products, searchQuery, selectedCategory, priceRange]
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <HeroSection />
        <CartDrawer />
      </div>

      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      <ProductGrid products={filteredProducts} />
    </div>
  );
};

export default ProductShowcase;
