export interface GroupPricing {
  id: string;
  name: string;
  discountPercentage: number;
  minQuantity: number;
  maxQuantity: number;
  pharmacyGroups: string[];
  status: "active" | "inactive";
  createdAt: Date;
}