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
import { Json } from "@/integrations/supabase/types"

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
      address: Json
    }
    shippingInfo?: {
      fullName: string
      phone: string
      email: string
      address: Json

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
    payment_status: string
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

  return (
    <SheetContent className="w-full sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] overflow-y-auto p-2 sm:p-6">
      {/* Visible invoice preview - responsive */}
      <div ref={invoiceRef} className="border p-3 sm:p-6 space-y-4 sm:space-y-8 bg-white">
        {/* Company Name & Logo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4 ">
          <div>
            <div className="flex gap-3">
              <img
                src={settings.logo || "/logo.png" || "/placeholder.svg"}
                alt="Company Logo"
                className="h-10 sm:h-12 md:h-16 relative z-10 contrast-200"
              />
            </div>
            <div className="mt-3 ml-0  text-xs sm:text-[12px]">
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

          <div className="w-full sm:w-auto text-right sm:text-right">
            <SheetTitle className="text-xl sm:text-2xl md:text-3xl">Invoice</SheetTitle>
            <p className="opacity-80 font-bold text-xs sm:text-sm">INVOICE -{invoice.invoice_number}</p>
            <p className="opacity-80 font-bold text-xs sm:text-sm">ORDER - {invoice.order_number}</p>
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
        <div className="flex justify-end border-t pt-4">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Sub Total</span>
              <span>${(invoice?.subtotal - invoice?.tax)?.toFixed(2) || "0.00"}</span>

            </div>

            <div className="flex justify-between text-xs sm:text-sm">
              <span>Tax ({invoice?.subtotal ? ((invoice.tax / invoice.subtotal) * 100).toFixed(2) : "0"}%)</span>
              <span>${invoice?.tax?.toFixed(2) || "0.00"}</span>
            </div>

            <Separator />
            <div className="flex justify-between font-bold text-sm sm:text-base">
              <span>Total</span>
              <span>${invoice?.total?.toFixed(2) || "0.00"}</span>
            </div>

            <p
              className={`px-3 py-1 rounded-full text-sm font-medium 
              ${invoice?.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {invoice?.payment_status === "paid" ? "✅ Paid" : "❌ Unpaid"}
            </p>

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
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <div className="flex gap-3">
                <img
                  src={
                    settings.logo || "/lovable-uploads/0b13fa53-b941-4c4c-9dc4-7d20221c2770.png" || "/placeholder.svg"
                  }
                  alt="Company Logo"
                  className="h-16 relative z-10 contrast-200"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="mt-3 text-[12px]">
                Tax ID : 99-0540972 <br />
                936 Broad River Ln,
                <br />
                Charlotte,  NC 28211
                <br />
                +1 800 969 6295 <br />
                info@9rx.com <br />
                www.9rx.com
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-3xl font-bold">Invoice</h1>
              <p className="opacity-80 font-bold text-sm">INVOICE -{invoice.invoice_number}</p>
              <p className="opacity-80 font-bold text-sm">ORDER - {invoice.order_number}</p>
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
          <div className="flex justify-end border-t pt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Sub Total</span>
                <span>${invoice?.subtotal?.toFixed(2) || "0.00"}</span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <span>Tax ({invoice?.subtotal ? ((invoice.tax / invoice.subtotal) * 100).toFixed(2) : "0"}%)</span>
                <span>${invoice?.tax?.toFixed(2) || "0.00"}</span>
              </div>

              <div className="border-t border-gray-300 my-2"></div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${invoice?.total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  )
}

