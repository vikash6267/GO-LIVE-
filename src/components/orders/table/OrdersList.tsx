import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderFormValues } from "../schemas/orderSchema";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrackingUrl } from "../utils/shippingUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { OrderActions } from "./OrderActions";
import { generateOrderId } from "../utils/orderUtils";
import { getOrderDate } from "../utils/dateUtils";
import { getCustomerName, formatTotal } from "../utils/customerUtils";
import { getStatusColor } from "../utils/statusUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import PaymentForm from "@/components/PaymentModal";

interface OrdersListProps {
  orders: OrderFormValues[];
  onOrderClick: (order: OrderFormValues) => void;
  selectedOrder: OrderFormValues | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onProcessOrder?: (orderId: string) => void;
  onShipOrder?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => Promise<void>;
  isLoading?: boolean;
  userRole?: "admin" | "pharmacy" | "group" | "hospital";
  selectedOrders?: string[];
  onOrderSelect?: (orderId: string) => void;
  setOrderStatus?: (status: string) => void;
}

export function OrdersList({
  orders,
  onOrderClick,
  selectedOrder,
  isEditing,
  setIsEditing,
  onProcessOrder,
  onShipOrder,
  onConfirmOrder,
  onDeleteOrder,
  isLoading = false,
  userRole = "pharmacy",
  selectedOrders = [],
  onOrderSelect,
  setOrderStatus,
}: OrdersListProps) {
  const { toast } = useToast();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectCustomerInfo, setSelectCustomerInfo] = useState<any>({});

  const createInvoiceForOrder = async (
    orderId: string,
    orderData: OrderFormValues
  ) => {
    try {
      // Generate invoice number using the database function
      // const { data: invoiceNumberData, error: invoiceNumberError } =
      //   await supabase.rpc("generate_invoice_number");

      // if (invoiceNumberError) throw invoiceNumberError;

      // const invoiceNumber = invoiceNumberData;

      // // Create the invoice
      // const { error: createError } = await supabase.from("invoices").insert({
      //   invoice_number: invoiceNumber,
      //   order_id: orderId,
      //   profile_id: orderData.customer,
      //   status: "needs_payment_link",
      //   amount: parseFloat(orderData.total),
      //   total_amount: parseFloat(orderData.total),
      //   due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      //   items: orderData.items,
      //   customer_info: orderData.customerInfo,
      //   shipping_info: orderData.shipping,
      // });

      // if (createError) throw createError;

      // toast({
      //   title: "Invoice Created",
      //   description: `Invoice ${invoiceNumber} has been created and needs payment link`,
      // });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice for the order",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: string,
    trackingNumber?: string,
    shippingMethod?: string
  ) => {
    try {
      // Prepare update data
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };


      console.log("shippingMethod", shippingMethod)
      console.log("trackingNumber", trackingNumber)
      
      // Add shipping information if provided
      if (trackingNumber && shippingMethod) {
        updateData.tracking_number = trackingNumber;
        updateData.shipping_method = shippingMethod;
      }

      const { data: orderExists, error: checkError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking order:", checkError);
        throw checkError;
      }

      if (!orderExists) {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      // If the order is being confirmed, create an invoice
      if (newStatus === "pending") {
        const orderData = orders.find((order) => order.id === orderId);
        if (orderData) {
          await createInvoiceForOrder(orderId, orderData);
        }
      }

      // Call the appropriate callback
      switch (newStatus) {
        case "processing":
          if (onProcessOrder) onProcessOrder(orderId);
          break;
        case "shipped":
          if (onShipOrder) onShipOrder(orderId);
          break;
        case "pending":
          if (onConfirmOrder) onConfirmOrder(orderId);
          break;
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

 

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No orders found</div>
    );
  }

  console.log(orders)
  return (
    <Table className=" border-gray-300">
    <TableHeader className="bg-gray-100">
      <TableRow>
        {userRole === "admin" && onOrderSelect && (
          <TableHead className="w-[50px] text-center  border-gray-300">
            <span className="sr-only">Select</span>
          </TableHead>
        )}
        <TableHead className="font-semibold text-center border-gray-300">
          Customer Name
        </TableHead>
        <TableHead className="font-semibold text-center border-gray-300">
          Order Date
        </TableHead>
        <TableHead className="font-semibold text-center border-gray-300">
          Total
        </TableHead>
        <TableHead className="font-semibold text-center border-gray-300">
          Status
        </TableHead>
        <TableHead className="font-semibold text-center border-gray-300">
          Payment Status
        </TableHead>
        <TableHead className="font-semibold text-center border-gray-300">
          Tracking
        </TableHead>
        {userRole === "admin" && (
          <TableHead className="font-semibold text-center border-gray-300">
            Actions
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
    <TableBody>
      {orders.map((order) => {
        const orderId = order.id || "";
        return (
          <TableRow key={orderId} className="cursor-pointer hover:bg-gray-50">
            {userRole === "admin" && onOrderSelect && (
              <TableCell onClick={(e) => e.stopPropagation()} className="text-center border-gray-300">
                <Checkbox
                  checked={selectedOrders.includes(orderId)}
                  onCheckedChange={() => onOrderSelect(orderId)}
                />
              </TableCell>
            )}
            <TableCell onClick={() => onOrderClick(order)} className="font-medium text-center border-gray-300">
              {order.customerInfo?.name || "N/A"}
            </TableCell>
            <TableCell className="text-center border-gray-300">
              {(() => {
                const dateObj = new Date(order.date);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                return (
                  <>
                    {formattedDate} <br />
                    {formattedTime}
                  </>
                );
              })()}
            </TableCell>
            <TableCell className="text-center border-gray-300">{formatTotal(order.total)}</TableCell>
            <TableCell className="text-center border-gray-300">
              <Badge variant="secondary" className={getStatusColor(order.status || "")}>
                {order.status.toUpperCase() || "pending"}
              </Badge>
            </TableCell>
            <TableCell className="text-center border-gray-300">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className={getStatusColor(order?.payment_status || "")}>
                  {order?.payment_status.toUpperCase() || "UNPAID"}
                </Badge>
                {order?.payment_status.toLowerCase() === "unpaid" && (
                  <button
                    onClick={() => {
                      console.log("Cliced")
                      setSelectCustomerInfo(order);
                      setModalIsOpen(true);
                    }}
                    className="bg-green-600 text-[14px] text-white px-5 py-1 rounded-md transition"
                  >
                    Pay
                  </button>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center border-gray-300">
              {order.shipping?.trackingNumber && order?.shipping.method !== "custom"  ? (
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      getTrackingUrl(order.shipping.method, order.shipping.trackingNumber!),
                      "_blank"
                    );
                  }}
                >
                  {order.shipping.trackingNumber}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              ):(

                <Button
                variant="secondary"
                className="p-0 h-auto font-normal"
              
              >
               Manually
              
              </Button>
              )}
            </TableCell>
            {userRole === "admin" && (
              <TableCell onClick={(e) => e.stopPropagation()} className="text-center border-gray-300">
                <OrderActions
                  order={order}
                  onProcessOrder={async (id) => {
                    await handleStatusChange(id, "processing");
                    setOrderStatus("processing")
                  }}
                  onShipOrder={async (id) => {
                    await handleStatusChange(id, "shipped", order.shipping?.trackingNumber, order.shipping?.method);
                    setOrderStatus("shipped")

                  }}
                  onConfirmOrder={async (id) => {
                    await handleStatusChange(id, "pending");
                    setOrderStatus("pending")
                  }}
                  onDeleteOrder={onDeleteOrder}
                />
              </TableCell>
            )}
          </TableRow>
        );
      })}


{modalIsOpen && selectCustomerInfo && (
          <PaymentForm
            modalIsOpen={modalIsOpen}
            setModalIsOpen={setModalIsOpen}
            customer={selectCustomerInfo.customerInfo}
            amountP={selectCustomerInfo.total}
            orderId={selectCustomerInfo.id}
            orders={orders}
          />
        )}
    </TableBody>
  </Table>
  
  
  );
}
