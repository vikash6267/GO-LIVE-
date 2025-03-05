
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_CONFIGS } from "../../schemas/productSchema";
import { NewSizeState } from "../../types/size.types";

interface AddSizeFormProps {
  newSize: NewSizeState;
  onSizeChange: (newSize: NewSizeState) => void;
  onAddSize: () => void;
  category: string;
}

export const AddSizeForm = ({ newSize, onSizeChange, onAddSize, category }: AddSizeFormProps) => {
  const categoryConfig = CATEGORY_CONFIGS[category as keyof typeof CATEGORY_CONFIGS] || CATEGORY_CONFIGS.OTHER;

  return (
    <div className="grid grid-cols-7 gap-4 items-end">
      <div>
        <FormLabel>Size Value</FormLabel>
        <Input
          type="text"
          value={newSize.size_value}
          onChange={(e) => onSizeChange({ ...newSize, size_value: e.target.value })}
          placeholder={`e.g., 500`}
        />
      </div>
      <div>
        <FormLabel>SKU</FormLabel>
        <Input
          type="text"
          value={newSize.sku}
          onChange={(e) => onSizeChange({ ...newSize, sku: e.target.value })}
          placeholder={`e.g., 500`}
        />
      </div>
      <div>
        <FormLabel>Unit</FormLabel>
        <Select
          value={newSize.size_unit}
          onValueChange={(value) => onSizeChange({ ...newSize, size_unit: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {categoryConfig.sizeUnits.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {categoryConfig.hasRolls && (
        <div>
          <FormLabel>Rolls/CS</FormLabel>
          <Input
            type="number"
            value={newSize.rolls_per_case}
            onChange={(e) => onSizeChange({ ...newSize, rolls_per_case: e.target.value })}
            placeholder="18"
          />
        </div>
      )}
      <div>
        <FormLabel>$/CS</FormLabel>
        <Input
          type="number"
          value={newSize.pricePerCase}
          onChange={(e) => onSizeChange({ ...newSize, pricePerCase: e.target.value })}
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <div>
        <FormLabel>$/Unit</FormLabel>
        <Input
          type="number"
          value={newSize.price}
          onChange={(e) => onSizeChange({ ...newSize, price: e.target.value })}
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <div>
        <FormLabel>Shipping/CS</FormLabel>
        <Input
          type="number"
          value={newSize.shipping_cost}
          onChange={(e) => onSizeChange({ ...newSize, shipping_cost: e.target.value })}
          placeholder="15.00"
          step="0.01"
        />
      </div>
      <Button
        type="button"
        onClick={onAddSize}
        className="flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Size
      </Button>
    </div>
  );
};
