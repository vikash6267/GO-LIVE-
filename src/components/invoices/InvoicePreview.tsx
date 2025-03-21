"use client"

import { useEffect, useRef, useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { defaultValues } from "@/components/settings/settingsTypes"
import type { SettingsFormValues } from "@/components/settings/settingsTypes"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface Address {
  street: string
  city: string
  state: string
  zip_code: string
}

interface InvoicePreviewProps {
  invoice?: {
    id: string
    profile_id: string
    invoice_number: any
    order_number: any
    customerInfo?: {
      name: string
      phone: string
      email: string
      address: Address
    }
    shippingInfo?: {
      fullName: string
      phone: string
      email: string
      address: Address
    }
    items?: Array<{
      name: string
      description: string
      quantity: number
      price: number
      sizes: any[]
      amount: number
    }>
    subtotal?: number
    tax?: number
    total?: number
    payment_status: string,
    payment_method: string,
    payment_notes: string,
    created_at: string,
    payment_transication: string,
  }
}


export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { toast } = useToast()
  const settings: SettingsFormValues = defaultValues
  const invoiceRef = useRef<HTMLDivElement>(null)
  const pdfTemplateRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [componyName, setComponyName] = useState("")

  console.log(invoice)
  if (!invoice) {
    toast({
      title: "Error",
      description: "Invoice data is not available",
      variant: "destructive",
    })
    return (
      <SheetContent className="w-full sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No invoice data available</p>
        </div>
      </SheetContent>
    )
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      if (!pdfTemplateRef.current) return

      // Wait for any rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      const canvas = await html2canvas(pdfTemplateRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`Invoice_${invoice.id}.pdf`)

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const fetchUser = async () => {

    try {
      if (!invoice || !invoice.profile_id) return

      const userID = invoice.profile_id


      const { data, error } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", userID)
        .maybeSingle();

      if (error) {
        console.error("🚨 Supabase Fetch Error:", error);
        return;
      }

      if (!data) {
        console.warn("⚠️ No user found for this email.");
        return;
      }

      console.log("✅ User Data:", data);
      setComponyName(data.company_name || "")

    } catch (error) {

    }
  };

  useEffect(() => {
    fetchUser()
  }, [invoice])
  const formattedDate = new Date(invoice.created_at).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
  
  console.log(formattedDate); // Example output: 20/03/2025, 10:53:41
  
  return (
    <SheetContent className="w-full sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] overflow-y-auto p-2 sm:p-6">
      {/* Visible invoice preview - responsive */}
      <div ref={invoiceRef} className="border p-3 sm:p-6 space-y-4 sm:space-y-8 bg-white">
        {/* Company Name & Logo */}
        <div className="flex flex-col sm:flex-row justify-between  sm:items-center border-b pb-4 gap-4 ">
          <div>

            <div className="mt-3 ml-0  text-xs sm:text-[12px] w-full ">
              Tax ID : 99-0540972 <br />
              936 Broad River Ln,
              <br />
              Charlotte, NC 28211
              <br />
              +1 800 969 6295 <br />
              info@9rx.com <br />
              www.9rx.com <br />
            </div>
          </div>
          <div className="flex  items-center  justify-center  w-">

            <div className=" ">
              <img
                src={settings.logo || "/logo.png" || "/placeholder.svg"}
                alt="Company Logo"
                className="h-16 sm:h-16 md:h-[6rem] relative z-10 contrast-200"
              />
            </div>

          </div>

          <div className="w-full sm:w-auto text-right sm:text-right">
            <SheetTitle className="text-xl sm:text-2xl md:text-3xl">Invoice</SheetTitle>
            <p className="opacity-80 font-bold text-xs sm:text-sm">INVOICE -{invoice.invoice_number}</p>
            <p className="opacity-80 font-bold text-xs sm:text-sm">ORDER - {invoice.order_number}</p>
            <p className="opacity-80 font-bold text-xs sm:text-sm">Date - {formattedDate}</p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 border-b pb-4">
          <div>
            <h3 className="font-semibold text-sm sm:text-base">Bill To</h3>
            <p className="text-xs sm:text-sm">{componyName}</p>
            <p className="text-xs sm:text-sm">{invoice.customerInfo?.name || "N/A"}</p>
            <p className="text-xs sm:text-sm">{invoice.customerInfo?.phone || "N/A"}</p>
            <p className="text-xs sm:text-sm">{invoice.customerInfo?.email || "N/A"}</p>
            <p className="text-xs sm:text-sm">{invoice.customerInfo.address?.street || "N/A"}, {invoice.customerInfo.address?.city || "N/A"}, {invoice.customerInfo.address?.state || "N/A"} {invoice.customerInfo.address?.zip_code || "N/A"}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <h3 className="font-semibold text-sm sm:text-base">Ship To</h3>
            <p className="text-xs sm:text-sm">{componyName}</p>
            <p className="text-xs sm:text-sm">{invoice.shippingInfo?.fullName || "N/A"}</p>
            <p className="text-xs sm:text-sm">{invoice.shippingInfo?.phone || "N/A"}</p>
            <p className="text-xs sm:text-sm">{invoice.shippingInfo?.email || "N/A"}</p>
            <p className="text-xs sm:text-sm">{invoice.shippingInfo.address?.street || "N/A"}, {invoice.shippingInfo.address?.city || "N/A"}, {invoice.shippingInfo.address?.state || "N/A"} {invoice.shippingInfo.address?.zip_code || "N/A"}</p>

          </div>
        </div>

        {/* Items Table - Responsive */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 min-w-[500px]">
            <thead className="bg-gray-200 text-xs sm:text-sm font-medium">
              <tr>
                <th className="border p-1 sm:p-2 text-left">Description</th>
                <th className="border p-1 sm:p-2 text-left">Sizes</th>
                <th className="border p-1 sm:p-2 text-right">Qty</th>
                {/* <th className="border p-1 sm:p-2 text-right">Rate</th> */}
                <th className="border p-1 sm:p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.items?.map((item, index) => (
                <tr key={index} className="border-b text-xs sm:text-sm">
                  <td className="border p-1 sm:p-2">{item.name}</td>
                  <td className="border p-1 sm:p-2">
                    {item.sizes?.map((size) => `${size.size_value} ${size.size_unit}`).join(", ")}
                  </td>
                  <td className="border p-1 sm:p-2 text-right">{item.quantity}</td>
                  {/* <td className="border p-1 sm:p-2 text-right">${item.price}</td> */}
                  <td className="border p-1 sm:p-2 text-right">${item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col lg:flex-row justify-between items-start border-t pt-4 space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Left: Payment Status */}
          <div className="w-full lg:w-1/3 p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
            {/* Payment Status */}
            <p
              className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-max text-left shadow-md 
      ${invoice?.payment_status === "paid"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"}`}
            >
              {invoice?.payment_status === "paid" ? "✅ Paid" : "❌ Unpaid"}
            </p>

            {/* Payment Details */}
            {invoice?.payment_status === "paid" && (
              <div className="mt-3 p-4 bg-white rounded-lg shadow-lg border-l-4 border-green-500">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {invoice.payment_method === "card" ? "💳 Transaction ID:" : "📝 Payment Notes:"}
                </p>
                <p className="text-sm text-gray-700 mt-1 bg-gray-100 px-3 py-2 rounded-md shadow-sm">
                  {invoice.payment_method === "card" ? invoice?.payment_transication : invoice?.payment_notes}
                </p>
              </div>
            )}
          </div>

          {/* Right: Invoice Summary */}
          <div className="w-full lg:w-2/3 p-4 bg-white rounded-lg shadow-md border border-gray-300">
            <div className="space-y-2">
              {/* Sub Total */}
              <div className="flex justify-between text-sm sm:text-base">
                <span>Sub Total</span>
                <span>${(invoice?.subtotal - invoice?.tax)?.toFixed(2) || "0.00"}</span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-sm sm:text-base">
                <span>Tax ({invoice?.subtotal ? ((invoice.tax / invoice.subtotal) * 100).toFixed(2) : "0"}%)</span>
                <span>${invoice?.tax?.toFixed(2) || "0.00"}</span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between font-bold text-base sm:text-lg">
                <span>Total</span>
                <span>${invoice?.total?.toFixed(2) || "0.00"}</span>
              </div>

              {/* Balance Due */}
              <div className="flex justify-between font-bold text-base sm:text-lg text-red-600">
                <span>Balance Due</span>
                <span>{invoice?.payment_status === "paid" ? "$0" : `${invoice?.total?.toFixed(2) || "0.00"}`}</span>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Download Button */}
      <div className="text-center pt-4">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base transition-colors disabled:opacity-50"
        >
          {isGeneratingPDF ? "Generating PDF..." : "Download Invoice"}
        </button>
      </div>

      {/* Hidden PDF template with fixed laptop-like dimensions - this will be used for PDF generation */}
      <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden">
        <div
          ref={pdfTemplateRef}
          className="w-[800px] p-6 space-y-8 bg-white border"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Company Name & Logo */}
          <div className="flex flex-col sm:flex-row justify-between  sm:items-center border-b pb-4 gap-4 ">
            <div>

              <div className="mt-3 ml-0  text-xs sm:text-[12px] w-full ">
                Tax ID : 99-0540972 <br />
                936 Broad River Ln,
                <br />
                Charlotte, NC 28211
                <br />
                +1 800 969 6295 <br />
                info@9rx.com <br />
                www.9rx.com <br />
              </div>
            </div>
            <div className="flex  items-center  justify-center  w-">

              <div className=" ">
                <img
                  src={settings.logo || "/logo.png" || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-16 sm:h-16 md:h-[6rem] relative z-10 contrast-200"
                />
              </div>

            </div>

            <div className="w-full sm:w-auto text-right sm:text-right">
              <SheetTitle className="text-xl sm:text-2xl md:text-3xl">Invoice</SheetTitle>
              <p className="opacity-80 font-bold text-xs sm:text-sm">INVOICE -{invoice.invoice_number}</p>
              <p className="opacity-80 font-bold text-xs sm:text-sm">ORDER - {invoice.order_number}</p>
            <p className="opacity-80 font-bold text-xs sm:text-sm">Date - {formattedDate}</p>

            </div>
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
              <p>{invoice.shippingInfo?.fullName || "N/A"}</p>
              <p>{invoice.shippingInfo?.phone || "N/A"}</p>
              <p>{invoice.shippingInfo?.email || "N/A"}</p>
            </div>
          </div>

          {/* Items Table - Fixed width for PDF */}
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200 text-sm font-medium">
              <tr>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Sizes</th>
                <th className="border p-2 text-right">Qty</th>
                <th className="border p-2 text-right">Amount</th>

              </tr>
            </thead>
            <tbody>
              {invoice?.items?.map((item, index) => (
                <tr key={index} className="border-b text-sm">
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">
                    {item.sizes?.map((size) => `${size.size_value} ${size.size_unit}`).join(", ")}
                  </td>
                  <td className="border p-2 text-right">{item.quantity}</td>
                  <td className="border p-2 text-right">${item.price}</td>
                  <td className="border p-2 text-right">${item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-between items-start border-t pt-4 space-x-4">
            {/* Left: Payment Status */}
            <div className="w-1/3 p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
              {/* Payment Status */}
              <p
                className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-max text-left shadow-md 
      ${invoice?.payment_status === "paid"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"}`}
              >
                {invoice?.payment_status === "paid" ? "✅ Paid" : "❌ Unpaid"}
              </p>

              {/* Payment Details */}
              {invoice?.payment_status === "paid" && (
                <div className="mt-3 p-4 bg-white rounded-lg shadow-lg border-l-4 border-green-500">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {invoice.payment_method === "card" ? "💳 Transaction ID:" : "📝 Payment Notes:"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1 bg-gray-100 px-3 py-2 rounded-md shadow-sm">
                    {invoice.payment_method === "card" ? invoice?.payment_transication : invoice?.payment_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Invoice Summary */}
            <div className="w-2/3 p-4 bg-white rounded-lg shadow-md border border-gray-300">
              <div className="space-y-2">
                {/* Sub Total */}
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Sub Total</span>
                  <span>${(invoice?.subtotal - invoice?.tax)?.toFixed(2) || "0.00"}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Tax ({invoice?.subtotal ? ((invoice.tax / invoice.subtotal) * 100).toFixed(2) : "0"}%)</span>
                  <span>${invoice?.tax?.toFixed(2) || "0.00"}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Total</span>
                  <span>${invoice?.total?.toFixed(2) || "0.00"}</span>
                </div>

                {/* Balance Due */}
                <div className="flex justify-between font-bold text-base sm:text-lg text-red-600">
                  <span>Balance Due</span>
                  <span>{invoice?.payment_status === "paid" ? "$0" : `$${invoice?.total?.toFixed(2) || "0.00"}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  )
}

