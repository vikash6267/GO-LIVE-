import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
    total?: number;
    payment_status: string;
  };
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { toast } = useToast();
  const settings: SettingsFormValues = defaultValues;
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Invoice_${invoice.id}.pdf`);
  };

  return (
    <SheetContent className=" sm:min-w-[900px] overflow-y-auto min-w-[30vw]">
      <div ref={invoiceRef} className="border p-6 space-y-8 bg-white">
        {/* Company Name & Logo */}
        <div className="flex justify-between items-center border-b pb-4">
          <div className=" flex gap-3">
            <img
              src={
                settings.logo ||
                "/lovable-uploads/0b13fa53-b941-4c4c-9dc4-7d20221c2770.png"
              }
              alt="Company Logo"
              className=" h-12 sm:h-16 relative z-10 contrast-200"
            />

            <h2 className="text-xl font-bold mt-2">
              {settings.business_name || "9RX"}
            </h2>
          </div>
          <SheetTitle className="text-3xl">Invoice</SheetTitle>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-2 gap-8 border-b pb-4">
          <div>
            <h3 className="font-semibold">Bill To</h3>
            <p>{invoice.customerInfo?.name || "N/A"}</p>
            <p>{invoice.customerInfo?.phone || "N/A"}</p>
            <p>{invoice.customerInfo?.email || "N/A"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Ship To</h3>
            <p>{invoice.shippingInfo?.name || "N/A"}</p>
            <p>{invoice.shippingInfo?.phone || "N/A"}</p>
            <p>{invoice.shippingInfo?.email || "N/A"}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200 text-sm font-medium">
            <tr>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Sizes</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Rate</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice?.items?.map((item, index) => (
              <tr key={index} className="border-b text-sm">
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">
                  {item.sizes
                    ?.map((size) => `${size.size_value} ${size.size_unit}`)
                    .join(", ")}
                </td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2 text-right">${item.price}</td>
                <td className="border p-2 text-right">${item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t pt-4">
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
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center pt-4">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Download Invoice
        </button>
      </div>
    </SheetContent>
  );
}
