
import { ProductSize } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface ProductSizesProps {
  sizes: ProductSize[];
}

export const ProductSizes = ({ sizes }: ProductSizesProps) => {
  return (
    <div className="space-y-1">
      {sizes && sizes.length > 0 ? (
        sizes.map((size) => (
          <div key={size.id} className="flex items-center justify-between text-sm">
            <span>{size.size_value}{size.size_unit}</span>
            <span className="font-medium">${formatPrice(size.price)}</span>
          </div>
        ))
      ) : (
        <div className="text-sm text-muted-foreground">No size variations</div>
      )}
    </div>
  );
};
