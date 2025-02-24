import { SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { defaultValues } from "@/components/settings/settingsTypes";
import type { SettingsFormValues } from "@/components/settings/settingsTypes";
import { useToast } from "@/components/ui/use-toast";

interface InvoicePreviewProps {
  invoice?: {
    id: string;
    customerInfo?: {
      name: string;
      phone: string;
      email: string;
    };
    shippingInfo?: {
      name: string;
      phone: string;
      email: string;
    };
    items?: Array<{
      name: string;
      description: string;
      quantity: number;
      price: number;

      sizes: any[];
      amount: number;
    }>;
    subtotal?: number;
    tax?: number;
    payment_status: string;
    total?: number;
  };
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { toast } = useToast();
  const settings: SettingsFormValues = defaultValues;

  console.log(invoice);
  if (!invoice) {
    toast({
      title: "Error",
      description: "Invoice data is not available",
      variant: "destructive",
    });
    return (
      <SheetContent className="w-[800px] sm:w-[900px]">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No invoice data available</p>
        </div>
      </SheetContent>
    );
  }

  return (
    <SheetContent className="min-w-[800px] sm:min-w-[900px] overflow-y-auto min-w-[30vw]">
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="flex justify-between">
          <div>
            {settings.logo && (
              <img
                src={settings.logo}
                alt="Business Logo"
                className="h-12 mb-4"
              />
            )}
            {settings.showBusinessAddress && (
              <div className="text-sm mt-2">
                <p className="font-semibold">
                  {/* {settings.businessName || "Company Name"} */}
                </p>
                <p>{settings.address}</p>
                {settings.suite && <p>{settings.suite}</p>}
                <p>
                  {settings.city}, {settings.state} {settings.zipCode}
                </p>
                {settings.phone && <p>Phone: {settings.phone}</p>}
                {settings.email && <p>Email: {settings.email}</p>}
              </div>
            )}
          </div>
          <div className="text-right">
            <SheetTitle className="text-3xl mb-4">Invoice</SheetTitle>
            <p
              style={{ color: settings.invoiceAccentColor || "#2563eb" }}
              className="font-medium"
            >
              {settings.invoicePrefix || "INV"}-{invoice.id}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
             {invoice.payment_status === "paid" ? <span>Paid</span> : <span>Balance Due</span> } 

            </p>
            <p className="text-xl font-bold">
              ${invoice.total?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Bill To</h3>
            <div className="text-sm space-y-1">
              <p>{invoice.customerInfo?.name || "N/A"}</p>
              <p>{invoice.customerInfo?.phone || "N/A"}</p>
              <p>EMAIL: {invoice.customerInfo?.email || "N/A"}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Ship To</h3>
            <div className="text-sm space-y-1">
              <p>{invoice.shippingInfo?.name || "N/A"}</p>
              <p>{invoice.shippingInfo?.phone || "N/A"}</p>
              <p>EMAIL: {invoice.shippingInfo?.email || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-gray-300">
  {/* Table Header */}
  <thead className="bg-muted text-sm font-medium">
    <tr>
      <th className="border border-gray-300 p-2 text-left">Description</th>
      <th className="border border-gray-300 p-2 text-left">Sizes</th>
      <th className="border border-gray-300 p-2 text-right">Qty</th>
      <th className="border border-gray-300 p-2 text-right">Rate</th>
      <th className="border border-gray-300 p-2 text-right">Amount</th>
    </tr>
  </thead>

  {/* Table Body */}
  <tbody>
    {invoice?.items?.map((item, index) => (
      <tr key={index} className="border-b border-gray-300 text-sm">
        {/* Description */}
        <td className="border border-gray-300 p-2">{item.name}</td>

        {/* Sizes */}
        <td className="border border-gray-300 p-2">
          {item.sizes?.map((size, sizeIndex) => (
            <div key={sizeIndex}>
              {size.size_value} {size.size_unit}
            </div>
          ))}
        </td>

        {/* Quantity */}
        <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>

        {/* Price */}
        <td className="border border-gray-300 p-2 text-right">${item.price}</td>

        {/* Amount */}
        <td className="border border-gray-300 p-2 text-right">
          ${item.quantity * item.price}
        </td>
      </tr>
    ))}
  </tbody>
</table>


        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>${invoice?.subtotal?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (6%)</span>
              <span>${invoice?.tax?.toFixed(2) || "0.00"}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${invoice?.total?.toFixed(2) || "0.00"}</span>
            </div>
            <div
              className="flex justify-between font-bold"
              style={{ color: settings.invoiceAccentColor || "#2563eb" }}
            >
             {invoice.payment_status === "paid" ? <span>Paid</span> : <span>Balance Due</span> } 
              <span>${invoice?.total?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  );
}
