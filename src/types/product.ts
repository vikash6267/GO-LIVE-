
export interface ProductSize {
  id: string;
  product_id: string;
  size_value: string;
  size_unit: string;
  price: number;
  price_per_case: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  current_stock: number;
  min_stock: number;
  reorder_point: number;
  created_at: string;
  updated_at: string;
  quantity_per_case?: number;
  shipping_cost?: number;
  size_unit?: string;
  size_value?: number;
  base_price: number;
  image_url?: string;
  images?: string[];
  sizes?: ProductSize[];
  customization?: {
    allowed: boolean;
    options?: string[];
    price?: number;
  };
}

export const PRODUCT_CATEGORIES = [
  "RX VIALS",
  "RX LABELS",
  "LIQUID OVALS",
  "OINTMENT JARS",
  "RX PAPER BAGS",
  "RX PAPER BAGS FLAT/GUSSETED",
  "ORAL SYRINGES",
  "LIQUID OVAL ADAPTERS",
  "OTHER",
] as const;
