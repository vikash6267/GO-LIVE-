
import { useState, useEffect } from "react";
import { Invoice, InvoiceStatus, isInvoice, InvoiceRealtimePayload } from "../types/invoice.types";
import { InvoicePreview } from "../InvoicePreview";
import { Sheet } from "@/components/ui/sheet";
import { InvoiceTableContent } from "./InvoiceTableContent";
import { InvoiceFilters } from "./InvoiceFilters";
import { ExportOptions } from "./ExportOptions";
import { useToast } from "@/hooks/use-toast";
import { SortConfig } from "../types/table.types";
import { FilterValues, isValidFilterValues } from "../types/filter.types";
import { sortInvoices } from "../utils/sortUtils";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps {
  filterStatus?: InvoiceStatus;
}

export function InvoiceTableContainer({ filterStatus }: DataTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<FilterValues>({
    status: filterStatus || null,
  });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          payment_status,
          orders (order_number),
          profiles (first_name, last_name, email)
        `);

      if (filters.search) {
        query = query.ilike("invoice_number", `%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte("due_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("due_date", filters.dateTo);
      }
      if (filters.amountMin) {
        query = query.gte("amount", filters.amountMin);
      }
      if (filters.amountMax) {
        query = query.lte("amount", filters.amountMax);
      }

      const { data, error } = await query;
      console.log("Raw Data from Supabase:", data);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch invoices.",
          variant: "destructive",
        });
        console.error("Error fetching invoices:", error);
        return;
      }

      // Validate the response data
      const validInvoices = (data || []).filter(isInvoice);
      if (validInvoices.length !== data?.length) {
        console.warn("Some invoices failed validation:", 
          data?.filter((invoice) => !isInvoice(invoice))
        );
      }

      setInvoices(validInvoices);
    } catch (error) {
      console.error("Error in fetchInvoices:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching invoices.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('invoice-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        (payload: RealtimePostgresChangesPayload<Invoice>) => {
          console.log('Received real-time update:', payload);
          
          setRefreshTrigger(prev => prev + 1);
          
          const eventMessages = {
            INSERT: 'New invoice created',
            UPDATE: 'Invoice updated',
            DELETE: 'Invoice deleted'
          };

          const invoiceNumber = 
            (payload.new as Invoice | undefined)?.invoice_number || 
            (payload.old as Invoice | undefined)?.invoice_number || 
            'Unknown';
          
          toast({
            title: eventMessages[payload.eventType as keyof typeof eventMessages] || 'Invoice Changed',
            description: `Invoice ${invoiceNumber} has been modified.`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [filters, refreshTrigger]);

  const handleSort = (key: string) => {
    setSortConfig((currentSort) => {
      if (!currentSort || currentSort.key !== key) {
        return { key, direction: "asc" };
      }
      if (currentSort.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  const handleActionComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    if (isValidFilterValues(newFilters)) {
      setFilters(newFilters);
    } else {
      console.error("Invalid filter values:", newFilters);
      toast({
        title: "Error",
        description: "Invalid filter values provided.",
        variant: "destructive",
      });
    }
  };

  const sortedInvoices = sortInvoices(invoices, sortConfig);

  const transformInvoiceForPreview = (invoice: Invoice) => {
    try {
      const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
      const customerInfo = typeof invoice.customer_info === 'string' 
        ? JSON.parse(invoice.customer_info) 
        : invoice.customer_info;
      const shippingInfo = typeof invoice.shipping_info === 'string'
        ? JSON.parse(invoice.shipping_info)
        : invoice.shipping_info;

      return {
        id: invoice.id,
        customerInfo,
        shippingInfo,

        payment_status: invoice.payment_status, // ✅ Extracted correctly

        items,
        subtotal: invoice.subtotal,
        tax: invoice.tax_amount,
        total: invoice.total_amount
      };
    } catch (error) {
      console.error("Error transforming invoice for preview:", error);
      toast({
        title: "Error",
        description: "Failed to process invoice data for preview.",
        variant: "destructive",
      });
      return null;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <InvoiceFilters onFilterChange={handleFilterChange} />
        <ExportOptions invoices={invoices} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="w-full h-16" />
          ))}
        </div>
      ) : (
        <InvoiceTableContent
          invoices={sortedInvoices}
          onSort={handleSort}
          sortConfig={sortConfig}
          onActionComplete={handleActionComplete}
          onPreview={setSelectedInvoice}
        />
      )}

      <Sheet open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        {selectedInvoice && (
          <InvoicePreview 
            invoice={transformInvoiceForPreview(selectedInvoice) || undefined} 
          />
        )}
      </Sheet>
    </>
  );
}
