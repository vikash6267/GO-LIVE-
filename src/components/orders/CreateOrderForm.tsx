import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { OrderFormValues, orderFormSchema } from "./schemas/orderSchema";
import { CustomerSelectionField } from "./fields/CustomerSelectionField";
import { OrderItemsSection } from "./sections/OrderItemsSection";
import { PaymentSection } from "./sections/PaymentSection";
import { ShippingSection } from "./sections/ShippingSection";
import { OrderFormActions } from "./form/OrderFormActions";
import { useNavigate } from "react-router-dom";
import { generateOrderId, calculateOrderTotal } from "./utils/orderUtils";
import {
  validateOrderItems,
  useOrderValidation,
} from "./form/OrderFormValidation";
import { supabase } from "@/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { selectUserProfile } from "../../store/selectors/userSelectors";
import { useCart } from "@/hooks/use-cart";
import axios from "../../../axiosconfig"
import { InvoiceStatus, PaymentMethod } from "../invoices/types/invoice.types";
export interface CreateOrderFormProps {
  initialData?: Partial<OrderFormValues>;
  onFormChange?: (data: Partial<OrderFormValues>) => void;
  isEditing?:  boolean

}

export function CreateOrderForm({
  initialData,
  onFormChange,
  isEditing

}: CreateOrderFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const userProfile = useSelector(selectUserProfile);
  const { cartItems, clearCart } = useCart();


  console.log(userProfile)
  const totalShippingCost =
  sessionStorage.getItem("shipping") == "true"
    ? 0
    : Math.max(...cartItems.map((item) => item.shipping_cost || 0));


 
  // Initialize form with user profile data
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      id: generateOrderId(),
      customer: userProfile?.id || "",
      date: new Date().toISOString(),
      total: "0",
      status: "new",
      payment_status: "unpaid",
      customerInfo: {
        name:
        initialData?.customerInfo.name ||
          `${initialData?.customerInfo.name || ""} ${userProfile?.last_name || ""}`,
        email: initialData?.customerInfo?.email || "",
        phone: userProfile?.mobile_phone || "",
        type: "Pharmacy",
        address: {
          street: userProfile?.company_name || "",
          city: userProfile?.city || "",
          state: userProfile?.state || "",
          zip_code: userProfile?.zip_code || "",
        },
      },

      shippingAddress: {
        fullName:
        initialData?.customerInfo.name ||
          `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`,
        email: initialData?.customerInfo?.email || "",
        phone: userProfile?.mobile_phone || "",
        address: {
          street: userProfile?.company_name || "",
          city: userProfile?.city || "",
          state: userProfile?.state || "",
          zip_code: userProfile?.zip_code || "",
        },
      },


      order_number: "",
      items: cartItems,
      shipping: {
        method: "FedEx",
        cost: totalShippingCost,
        trackingNumber: "",
        estimatedDelivery: "",
      },
      payment: {
        method: "card",
        notes: "",
      },
      specialInstructions: "",
      ...initialData,
    },
  });


  // Load pending order items from localStorage if they exist
  useEffect(() => {
    const pendingOrderItems = localStorage.getItem("pendingOrderItems");
    if (pendingOrderItems) {
      const items = JSON.parse(pendingOrderItems);
      form.setValue("items", items);
      setOrderItems(items.map((_, index) => ({ id: index + 1 })));
      localStorage.removeItem("pendingOrderItems"); // Clear after loading
    }
  }, [form]);

  const { validateForm } = useOrderValidation(form, onFormChange);

  useEffect(() => {
    const subscription = form.watch((data) => {
      setIsValidating(true);
      validateForm(data);
      setIsValidating(false);
    });
    return () => subscription.unsubscribe();
  }, [form, validateForm]);

  const onSubmit = async (data: OrderFormValues) => {
    console.log("first");
    try {
      setIsSubmitting(true);
      console.log("Starting order submission:", data);


      
      // Validate order items
      validateOrderItems(data.items);

      // Calculate order total
      const calculatedTotal = calculateOrderTotal(
        data.items,
        totalShippingCost || 0
      );

    
      if (userProfile?.id == null) {
        toast({
          title: "User profile not found",
          description: "Please log in to create an order.",
          duration: 5000,
          variant: "destructive",
        });
        return;
      }

      // Check stock availability
      for (const item of data.items) {
        const { data: product, error: stockError } = await supabase
          .from("products")
          .select("current_stock")
          .eq("id", item.productId)
          .single();

        if (stockError || !product) {
          throw new Error(
            `Could not check stock for product ID: ${item.productId}`
          );
        }

        if (product.current_stock < item.quantity) {
          toast({
            title: "Insufficient Stock",
            description: `Product ID: ${item.productId} has only ${product.current_stock} units available.`,
            variant: "destructive",
          });
          console.error("Insufficient stock for product ID:", item.productId);
          return;
        }
      }

      // Calculate default estimated delivery date (10 days from today)
      const defaultEstimatedDelivery = new Date();
      defaultEstimatedDelivery.setDate(defaultEstimatedDelivery.getDate() + 10);


      
      // Prepare order data
      const orderData = {
        order_number:  generateOrderId(),
        profile_id: userProfile.id,
        status: data.status,
        total_amount: calculatedTotal,
        shipping_cost: data.shipping?.cost || 0,
        tax_amount: 0,
        items: data.items,
        notes: data.specialInstructions,
        shipping_method: data.shipping?.method,
        customerInfo: data.customerInfo,
        shippingAddress: data.shippingAddress,
        tracking_number: data.shipping?.trackingNumber,
        estimated_delivery:
          data.shipping?.estimatedDelivery ||
          defaultEstimatedDelivery.toISOString(),
      };

      // Save order to Supabase
      const { data: orderResponse, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error(orderError.message);
      }

      console.log(orderResponse)
      const newOrder = orderResponse[0];
      console.log("Order saved:", newOrder);


      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');




      const estimatedDeliveryDate = new Date(newOrder.estimated_delivery);

// Calculate the due_date by adding 30 days to the estimated delivery
const dueDate = new Date(estimatedDeliveryDate);
dueDate.setDate(dueDate.getDate() + 30); // Add 30 days

// Format the due_date as a string in ISO 8601 format with time zone (UTC in this case)
const formattedDueDate = dueDate.toISOString(); // Example: "2025-04-04T13:45:00.000Z"

      const invoiceData = {
        invoice_number: invoiceNumber,
        order_id: newOrder.id,
        due_date: formattedDueDate,
        profile_id: newOrder.profile_id,
        status: "pending" as InvoiceStatus,
        amount: parseFloat(calculatedTotal) || 0,
        tax_amount: orderData.tax_amount || 0,
        total_amount: parseFloat(calculatedTotal),
          payment_status: newOrder.payment_status,
        payment_method: newOrder.paymentMethod as PaymentMethod,
        payment_notes: newOrder.notes || null,
        items: newOrder.items || [],
        customer_info: newOrder.customerInfo ||  {
          name: newOrder.customerInfo?.name,
          email: newOrder.customerInfo?.email || '',
          phone: newOrder.customerInfo?.phone || ''
        },
        shipping_info: orderData.shippingAddress || {},
        subtotal: calculatedTotal || parseFloat(calculatedTotal)
      };

      console.log('Creating invoice with data:', invoiceData);


      
      const { invoicedata2, error } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }

      console.log('Invoice created successfully:', invoicedata2);


      
      try {
        await axios.post("/order-place", newOrder);
        console.log("Order status sent successfully to backend.");
      } catch (apiError) {
        console.error("Failed to send order status to backend:", apiError);
      }
      // Prepare and save order items
      const orderItemsData = data.items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.quantity * item.price,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // console.log("Order items saved:", orderItemsData);

      // Update product stock
      for (const item of data.items) {
        // console.log("Updating stock for quantity ID:", item.quantity);
        const { error: stockUpdateError } = await supabase.rpc(
          "decrement_stock",
          { product_id: item.productId, quantity: item.quantity }
        );
        // console.log("stockUpdateError", stockUpdateError);
        if (stockUpdateError) {
          throw new Error(
            `Failed to update stock for product ID: ${item.productId}`
          );
        }
      }

      console.log("Stock updated successfully");

      // Reset form and local state
      // localStorage.removeItem("cart");

      toast({
        title: "Order Created Successfully",
        description: `Order ID: ${newOrder.id} has been created.`,
      });

      form.reset();
      // setOrderItems([{ id: 1 }]);
      navigate("/pharmacy/orders");
      await clearCart();
    } catch (error) {
      console.error("Order creation error:", error);
      toast({
        title: "Error Creating Order",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem creating your order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomerSelectionField form={form} initialData={initialData} />

        <OrderItemsSection orderItems={cartItems} form={form} />

        <ShippingSection form={form} />

        <PaymentSection form={form} />

        <OrderFormActions
          orderData={form.getValues()}
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          isEditing={isEditing}
        />
      </form>
    </Form>
  );
}
