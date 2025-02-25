import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InventoryItem } from "@/hooks/use-inventory-tracking";
import { Badge } from "@/components/ui/badge";

interface InventoryReportsProps {
  inventoryData: InventoryItem[];
}

export const InventoryReports = ({ inventoryData }: InventoryReportsProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Inventory Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border ">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 border-b bg-white">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Current Stock
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Minimum Stock
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Reorder Point
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Base Price
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {inventoryData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium max-w-[200px] truncate">
                      {item.name}
                    </td>
                    <td className="p-4 align-middle">{item.current_stock}</td>
                    <td className="p-4 align-middle">{item.min_stock}</td>
                    <td className="p-4 align-middle">{item.reorder_point}</td>
                    <td className="p-4 align-middle">
                      ${item.base_price.toFixed(2)}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={
                          item.current_stock > item.min_stock
                            ? "success"
                            : "destructive"
                        }
                        className="rounded-full"
                      >
                        {item.current_stock > item.min_stock
                          ? "In Stock"
                          : "Low Stock"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
