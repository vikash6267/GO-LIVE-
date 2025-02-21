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
      id: string;
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    subtotal?: number;
    tax?: number;
    total?: number;
  };
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { toast } = useToast();
  const settings: SettingsFormValues = defaultValues;

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
    <SheetContent className="w-[800px] sm:w-[900px] overflow-y-auto">
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="flex justify-between">
          <div>
            {settings.logo && (
              <img src={settings.logo} alt="Business Logo" className="h-12 mb-4" />
            )}
            {settings.showBusinessAddress && (
              <div className="text-sm mt-2">
                <p className="font-semibold">{settings.businessName || 'Company Name'}</p>
                <p>{settings.address}</p>
                {settings.suite && <p>{settings.suite}</p>}
                <p>{settings.city}, {settings.state} {settings.zipCode}</p>
                {settings.phone && <p>Phone: {settings.phone}</p>}
                {settings.email && <p>Email: {settings.email}</p>}
              </div>
            )}
          </div>
          <div className="text-right">
            <SheetTitle className="text-3xl mb-4">Invoice</SheetTitle>
            <p style={{ color: settings.invoiceAccentColor || '#2563eb' }} className="font-medium">
              {settings.invoicePrefix || 'INV'}-{invoice.id}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Balance Due</p>
            <p className="text-xl font-bold">${invoice.total?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Bill To</h3>
            <div className="text-sm space-y-1">
              <p>{invoice.customerInfo?.name || 'N/A'}</p>
              <p>{invoice.customerInfo?.phone || 'N/A'}</p>
              <p>EMAIL: {invoice.customerInfo?.email || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Ship To</h3>
            <div className="text-sm space-y-1">
              <p>{invoice.shippingInfo?.name || 'N/A'}</p>
              <p>{invoice.shippingInfo?.phone || 'N/A'}</p>
              <p>EMAIL: {invoice.shippingInfo?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <div className="p-2 grid grid-cols-12 gap-4 bg-muted text-sm font-medium">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {invoice.items?.map((item) => (
            <div key={item.id} className="p-2 grid grid-cols-12 gap-4 text-sm border-b">
              <div className="col-span-1">{item.id}</div>
              <div className="col-span-5">{item.description}</div>
              <div className="col-span-2 text-right">{item.quantity}</div>
              <div className="col-span-2 text-right">${item.rate.toFixed(2)}</div>
              <div className="col-span-2 text-right">${item.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>${invoice.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (6%)</span>
              <span>${invoice.tax?.toFixed(2) || '0.00'}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${invoice.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div 
              className="flex justify-between font-bold" 
              style={{ color: settings.invoiceAccentColor || '#2563eb' }}
            >
              <span>Balance Due</span>
              <span>${invoice.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  );
}