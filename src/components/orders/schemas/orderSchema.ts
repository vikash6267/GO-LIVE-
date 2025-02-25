import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z
    .string()
    .min(5, "Zip code is required")
    .max(10, "Zip code must be at most 10 characters"),
});

const customerInfoSchema = z.object({
  name: z.string().min(0, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(0, "Phone number must be at least 10 digits"),
  type: z.enum(["Hospital", "Pharmacy", "Clinic"]),
  address: addressSchema,
});

const sizeSchema = z.object({
  id: z.string().min(1, "Size ID is required"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().min(0, "Quantity must be at least 0"),
  size_unit: z.string().min(1, "Size unit is required"),
  size_value: z.string().min(1, "Size value is required"),
});

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be a positive number"),
  sizes: z.array(sizeSchema).optional(), // Add sizes as an array of size objects
  notes: z.string().optional(),
});

const shippingSchema = z.object({
  method: z.enum(["FedEx", "custom"]),
  cost: z.number().min(0, "Shipping cost must be a positive number"),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

const paymentSchema = z.object({
  method: z.enum(["card", "bank_transfer", "manual", "ach"]),
  notes: z.string().optional(),
  achAccountType: z
    .enum(["checking", "savings", "businessChecking"])
    .optional(),
  achAccountName: z.string().optional(),
  achRoutingNumber: z.string().optional(),
  achAccountNumber: z.string().optional(),
});

// Add shippingAddress schema
const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(5, "Zip code is required"),
});

export const orderFormSchema = z.object({
  id: z.string(),
  customer: z.string(),
  date: z.string(),
  total: z.string(),
  status: z.string(),
  payment_status: z.string(), // ✅ Add this line

  customerInfo: customerInfoSchema,
  items: z.array(orderItemSchema),
  shipping: shippingSchema,
  payment: paymentSchema,
  specialInstructions: z.string().optional(),
  shippingAddress: shippingAddressSchema.optional(), // Add shipping address to main schema
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
