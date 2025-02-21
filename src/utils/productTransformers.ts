
import { Product } from "@/types/product";

export const transformProductData = (productsData: any[]): Product[] => {
  return productsData?.map(product => ({
    ...product,
    sizes: product.sizes?.map(size => ({
      ...size,
      size_value: String(size.size_value)
    })),
    customization: product.customization ? {
      allowed: (product.customization as any).allowed ?? false,
      options: (product.customization as any).options ?? [],
      price: typeof (product.customization as any).price === 'number' 
        ? (product.customization as any).price 
        : 0,
    } : {
      allowed: false,
      options: [],
      price: 0,
    }
  })) || [];
};
