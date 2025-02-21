
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Product } from "@/types/product";
import { Package2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductActions } from "./table/ProductActions";
import { ProductSizes } from "./table/ProductSizes";
import { ProductStock } from "./table/ProductStock";
import { formatPrice } from "@/lib/utils";

interface ProductsTableProps {
  products: Product[];
  currentPage: number;
  totalProducts: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  groupId?: string;
}

export const ProductsTable = ({
  products,
  currentPage,
  totalProducts,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  groupId,
}: ProductsTableProps) => {
  const getGroupPrice = (product: Product, groupId?: string) => {
    if (!groupId) return product.base_price;

    const groupPricingRules = JSON.parse(localStorage.getItem("groupPricing") || "[]");
    const applicableRule = groupPricingRules.find((rule: any) =>
      rule.pharmacyGroups.includes(groupId) && rule.status === "active"
    );

    return applicableRule
      ? product.base_price * (1 - applicableRule.discountPercentage)
      : product.base_price;
  };

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Sizes & Prices</TableHead>
              <TableHead>Case Qty</TableHead>
              {groupId && <TableHead>Group Price</TableHead>}
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>
                  <ProductSizes sizes={product.sizes || []} />
                </TableCell>
                <TableCell>
                  {product.quantity_per_case ? (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Package2 className="h-4 w-4" />
                      {product.quantity_per_case}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                {groupId && (
                  <TableCell className="text-green-600 font-medium">
                    ${formatPrice(getGroupPrice(product, groupId))}
                  </TableCell>
                )}
                <TableCell>
                  <ProductStock sizes={product.sizes} currentStock={product.current_stock} />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-gray-100">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      product.current_stock < product.min_stock
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {product.current_stock < product.min_stock ? "Low Stock" : "In Stock"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ProductActions 
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="p-4 border-t">
        <PaginationControls
          currentPage={currentPage}
          totalItems={totalProducts}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
