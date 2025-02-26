
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductFormValues } from "@/components/products/schemas/productSchema";

export const fetchProductsService = async (
  page: number,
  pageSize: number,
  category: string,
  searchQuery: string
) => {
  const offset = (page - 1) * pageSize;
  
  let query = supabase
    .from("products")
    .select(`
      *,
      sizes:product_sizes(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  return query;
};

export const addProductService = async (data: ProductFormValues) => {
  const productData = {
    sku: data.sku,
    name: data.name,
    description: data.description || '',
    category: data.category,
    base_price: data.base_price || 0,
    current_stock: data.current_stock || 0,
    min_stock: data.min_stock || 0,
    reorder_point: data.reorder_point || 0,
    quantity_per_case: data.quantityPerCase || 1,
    customization: {
      allowed: data.customization?.allowed ?? false,
      options: data.customization?.options ?? [],
      price: data.customization?.price ?? 0
    },
    image_url: data.image_url || '',
    images: data.images || []
  };

  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (productError) {
    console.error("Error adding product:", productError);
    throw productError;
  }

  if (data.sizes && data.sizes.length > 0 && newProduct) {
    const sizesData = data.sizes.map(size => ({
      product_id: newProduct.id,
      size_value: size.size_value || '0',
      size_unit: size.size_unit || 'unit',
      price: size.price || 0,
      price_per_case: size.pricePerCase || 0,
      stock: size.stock || 0,
      rolls_per_case: size.rolls_per_case || 0,
      shipping_cost: size.shipping_cost || 15,
      quantity_per_case: size.quantity_per_case || 0 // ✅ Added this field

    }));

    const { error: sizesError } = await supabase
      .from("product_sizes")
      .insert(sizesData);

    if (sizesError) {
      console.error("Error adding product sizes:", sizesError);
      throw sizesError;
    }
  }

  return newProduct;
};

export const updateProductService = async (productId: string, data: ProductFormValues) => {
  // console.log("Updating product with data:", data);

  try {
    const { error: productError } = await supabase
      .from("products")
      .update({
        sku: data.sku,
        name: data.name,
        description: data.description || '',
        category: data.category,
        base_price: data.base_price || 0,
        current_stock: data.current_stock || 0,
        min_stock: data.min_stock || 0,
        reorder_point: data.reorder_point || 0,
        quantity_per_case: data.quantityPerCase || 1,
        customization: {
          allowed: data.customization?.allowed ?? false,
          options: data.customization?.options ?? [],
          price: data.customization?.price ?? 0
        },
        image_url: data.image_url || '',
        images: data.images || [],
        updated_at: new Date().toISOString()
      })
      .eq("id", productId);

    if (productError) {
      console.error("Error updating product:", productError);
      throw productError;
    }

    // Delete existing sizes
    const { error: deleteError } = await supabase
      .from("product_sizes")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Error deleting existing sizes:", deleteError);
      throw deleteError;
    }


    console.log(data.sizes)

    
    const sizesData = data.sizes.map(size => ({
      product_id: productId,
      size_value: size.size_value || "0",
      size_unit: size.size_unit || "unit",
      price: Number(size.price) || 0,
      stock: Number(size.stock) || 0,  
      price_per_case: Number(size.pricePerCase) || 0,
      quantity_per_case: Number(size.quantity_per_case) || 1, // ✅ Ensure conversion
      rolls_per_case: Number(size.rolls_per_case) || 1,
      shipping_cost: Number(size.shipping_cost) || 15, // ✅ Ensure conversion
    }));
    
    
    console.log(sizesData)
    


    const { error: sizesError } = await supabase
      .from("product_sizes")
      .insert(sizesData)
      .select(); // Fetch inserted data to confirm
    
    if (sizesError) {
      console.error("Error inserting sizes:", sizesError);
      throw sizesError;
    } else {
      console.log("Sizes inserted successfully!");
    }
    

    return { success: true };
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};

export const deleteProductService = async (id: string) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

export const bulkAddProductsService = async (products: Product[]) => {
  const { error } = await supabase.from("products").insert(products);
  if (error) throw error;
};
