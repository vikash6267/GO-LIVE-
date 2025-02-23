
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "../schemas/productSchema";

export interface SizeOptionsFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

export interface NewSizeState {
  size_value: string;
  size_unit: string;
  price: string;
  pricePerCase: string;
  stock: string;
  quantity_per_case: string;
  rolls_per_case: string;
  shipping_cost: string;
}
