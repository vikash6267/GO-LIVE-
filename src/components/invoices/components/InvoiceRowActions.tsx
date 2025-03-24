
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Send, Ban, RefreshCcw, Link, Copy, Check } from "lucide-react";
import { Invoice } from "../types/invoice.types";
import { ProcessRefundDialog } from "../../orders/refunds/ProcessRefundDialog";
import { useState } from "react";
import { handleInvoiceAction } from "../utils/invoiceWorkflow";
import { exportToPDF } from "./ExportOptions";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InvoiceRowActionsProps {
  invoice: Invoice;
  onPreview: (invoice: Invoice) => void;
  onActionComplete: () => void;
}

export function InvoiceRowActions({ invoice, onPreview, onActionComplete }: InvoiceRowActionsProps) {
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string>("");
  const { toast } = useToast();

  const handleAction = async (action: "send" | "cancel") => {
    await handleInvoiceAction(invoice, action);
    onActionComplete();
  };

  const generatePaymentLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Simulate payment link generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const link = `https://pay.example.com/invoice/${invoice.invoice_number}`;
      setPaymentLink(link);
      toast({
        title: "Payment Link Generated",
        description: "The payment link has been generated and copied to clipboard",
      });
      navigator.clipboard.writeText(link);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate payment link",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast({
      title: "Copied",
      description: "Payment link copied to clipboard",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => onPreview(invoice)}>
            Preview Invoice
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => exportToPDF(invoice)}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem> */}

          {invoice.status === "needs_payment_link" && (
            <DropdownMenuItem onClick={generatePaymentLink} disabled={isGeneratingLink}>
              <Link className="mr-2 h-4 w-4" />
              {isGeneratingLink ? "Generating Link..." : "Generate Payment Link"}
            </DropdownMenuItem>
          )}

          {paymentLink && (
            <>
              <DropdownMenuItem onClick={copyPaymentLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Payment Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("send")}>
                <Send className="mr-2 h-4 w-4" />
                Send Link to Customer
              </DropdownMenuItem>
            </>
          )}

          {invoice.status === "paid" && (
            <DropdownMenuItem onClick={() => setShowRefundDialog(true)}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Process Refund
            </DropdownMenuItem>
          )}

          {/* {["needs_payment_link", "payment_link_sent", "pending"].includes(invoice.status) && (
            <DropdownMenuItem onClick={() => handleAction("cancel")} className="text-red-600">
              <Ban className="mr-2 h-4 w-4" />
              Cancel Invoice
            </DropdownMenuItem>
          )} */}
        </DropdownMenuContent>
      </DropdownMenu>

      {showRefundDialog && (
        <ProcessRefundDialog
          orderId={invoice.order_id || ''}
          orderTotal={invoice.total_amount}
          originalTransactionId=""
          open={showRefundDialog}
          onOpenChange={setShowRefundDialog}
        />
      )}
    </>
  );
}
