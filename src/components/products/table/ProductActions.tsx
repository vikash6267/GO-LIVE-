
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ProductPreview } from "./ProductPreview";
import { useState } from "react";

interface ProductActionsProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductActions = ({ product, onEdit, onDelete }: ProductActionsProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Selected product:', product);
              setSelectedProduct(product);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </DialogTrigger>
        {selectedProduct && <ProductPreview product={selectedProduct} />}
      </Dialog>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(product)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(product.id)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
};
