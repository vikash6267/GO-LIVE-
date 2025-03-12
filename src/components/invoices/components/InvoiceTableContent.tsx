
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Invoice } from "../types/invoice.types";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceRowActions } from "./InvoiceRowActions";
import { InvoiceTableHeader } from "./InvoiceTableHeader";
import { SortConfig } from "../types/table.types";
import { motion } from "framer-motion";

interface InvoiceTableContentProps {
  invoices: Invoice[];
  onSort: (key: string) => void;
  sortConfig: SortConfig | null;
  onActionComplete: () => void;
  onPreview: (invoice: Invoice) => void;
}

export function InvoiceTableContent({
  invoices,
  onSort,
  sortConfig,
  onActionComplete,
  onPreview
}: InvoiceTableContentProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <InvoiceTableHeader onSort={onSort} sortConfig={sortConfig} />
        <TableBody>
  {invoices.map((invoice, index) => (
    <motion.tr
      key={invoice.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="hover:bg-muted/50 cursor-pointer"
      onClick={() => onPreview(invoice)}
    >
      <TableCell className="text-center">{invoice.invoice_number}</TableCell>
      <TableCell className="text-center">{invoice.orders?.order_number}</TableCell>
      <TableCell className="text-center">
        {typeof invoice.customer_info === "object" &&
        invoice.customer_info !== null &&
        "name" in invoice.customer_info
          ? invoice.customer_info.name
          : `${invoice.profiles?.first_name ?? ""} ${invoice.profiles?.last_name ?? ""}`.trim()}
      </TableCell>
      <TableCell className="text-center">${invoice.amount.toFixed(2)}</TableCell>
      <TableCell className="text-center">
        <InvoiceStatusBadge status={invoice.payment_status} />
      </TableCell>
      <TableCell className="text-center">
        {new Date(invoice.due_date).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <InvoiceRowActions invoice={invoice} onPreview={onPreview} onActionComplete={onActionComplete} />
      </TableCell>
    </motion.tr>
  ))}
  {invoices.length === 0 && (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
        No invoices found
      </TableCell>
    </TableRow>
  )}
</TableBody>

      </Table>
    </div>
  );
}
