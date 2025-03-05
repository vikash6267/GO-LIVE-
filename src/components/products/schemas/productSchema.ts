
import * as z from "zod";

// Define category-specific configurations
export const CATEGORY_CONFIGS = {
  "RX VIALS": {
    sizeUnits: ["mL", "dram", "oz"],
    defaultUnit: "mL",
    hasRolls: false,
    requiresCase: true,
  },
  "RX LABELS": {
    sizeUnits: ["ROLL"],
    defaultUnit: "ROLL",
    hasRolls: true,
    requiresCase: true,
  },
  "LIQUID OVALS": {
    sizeUnits: ["mL", "OZ"],
    defaultUnit: "mL",
    hasRolls: false,
    requiresCase: true,
  },
  "OINTMENT JARS": {
    sizeUnits: ["OZ", "gram"],
    defaultUnit: "OZ",
    hasRolls: false,
    requiresCase: true,
  },
  "RX PAPER BAGS": {
    sizeUnits: ["inch"],
    defaultUnit: "inch",
    hasRolls: false,
    requiresCase: true,
  },
  "RX PAPER BAGS FLAT/GUSSETED": {
    sizeUnits: ["inch"],
    defaultUnit: "inch",
    hasRolls: false,
    requiresCase: true,
  },
  "ORAL SYRINGES": {
    sizeUnits: ["mL", "cc"],
    defaultUnit: "mL",
    hasRolls: false,
    requiresCase: true,
  },
  "LIQUID OVAL ADAPTERS": {
    sizeUnits: ["mm"],
    defaultUnit: "mm",
    hasRolls: false,
    requiresCase: true,
  },
  "OTHER": {
    sizeUnits: ["unit"],
    defaultUnit: "unit",
    hasRolls: false,
    requiresCase: false,
  },
} as const;

export const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string(),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.object({
    size_value: z.string().min(1, "Size value is required"),
    size_unit: z.string(),
    sku: z.string(),
    price: z.coerce.number().min(0, "Price must be positive"),
   
    price_per_case: z.coerce.number().min(0, "Price per case must be positive"),
    stock: z.coerce.number().min(0, "Stock must be positive"),
    rolls_per_case: z.coerce.number().min(0, "Rolls per case must be positive"),
    shipping_cost: z.coerce.number().min(0, "Shipping cost must be positive"),
    quantity_per_case: z.coerce.number().min(0, "Quantity per case must be positive") // ✅ Added this field
  })).default([]),
  
  base_price: z.coerce.number().min(0, "Base price must be positive").default(0),
  current_stock: z.coerce.number()
    .min(0, "Stock cannot be negative")
    .default(0),
  min_stock: z.coerce.number()
    .min(0, "Minimum stock cannot be negative")
    .default(0),
  reorder_point: z.coerce.number()
    .min(0, "Reorder point must be positive")
    .refine(val => val >= 0, "Reorder point must be greater than or equal to minimum stock")
    .default(0),
  quantityPerCase: z.coerce.number().min(1, "Quantity per case must be at least 1"),
  customization: z.object({
    allowed: z.boolean().default(false),
    options: z.array(z.string()).default([]),
    price: z.coerce.number().min(0, "Customization price must be positive").optional(),
  }).default({ allowed: false, options: [], price: 0 }),
  trackInventory: z.boolean().default(false),
  image_url: z.string().optional(),
  item_number: z.string().optional(),
  shipping_cost: z.coerce.number().min(0, "Shipping cost must be positive").default(15),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
