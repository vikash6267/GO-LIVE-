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

export interface CreateOrderFormProps {
  initialData?: Partial<OrderFormValues>;
  onFormChange?: (data: Partial<OrderFormValues>) => void;
}

export function CreateOrderForm({
  initialData,
  onFormChange,
}: CreateOrderFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const userProfile = useSelector(selectUserProfile);
  const { cartItems, clearCart } = useCart();

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
          `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`,
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
        order_number: data.id || generateOrderId(),
        profile_id: userProfile.id,
        status: data.status,
        total_amount: calculatedTotal,
        shipping_cost: data.shipping?.cost || 0,
        tax_amount: 0,
        items: data.items,
        notes: data.specialInstructions,
        shipping_method: data.shipping?.method,
        customerInfo: data.customerInfo,
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

      const newOrder = orderResponse[0];
      console.log("Order saved:", newOrder);

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

  const addCartItemsToOrder = () => {
    console.log(cartItems);
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "There are no items in the cart to add.",
        variant: "destructive",
      });
      return;
    }

    const validCartItems = cartItems.filter((item) => item.productId);
    console.log(validCartItems);

    if (validCartItems.length === 0) {
      toast({
        title: "No valid items",
        description: "The cart does not contain valid items.",
        variant: "destructive",
      });
      return;
    }
    const newOrderItems = validCartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes || "",
      sizes: item.sizes
        ? item.sizes.map((size) => ({
            id: size.id,
            price: size.price,
            quantity: size.quantity,
            size_unit: size.size_unit,
            size_value: size.size_value,
          }))
        : [],
    }));

    form.setValue("items", []); // Reset form items
    setOrderItems([]); // Reset state order items

    form.setValue("items", [...form.getValues("items"), ...newOrderItems]);
    setOrderItems((prevOrderItems) => [
      ...prevOrderItems,
      ...newOrderItems.map((_, index) => ({
        id: prevOrderItems.length + index + 1,
      })),
    ]);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { id: orderItems.length + 1 }]);

    const currentItems = form.getValues("items") || [];
    form.setValue("items", [
      ...currentItems,
      {
        productId: "",
        quantity: 1,
        price: 0,
        notes: "",
        sizes: [
          { id: "", price: 0, quantity: 1, size_unit: "", size_value: "" },
        ], // Default size entry
      },
    ]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems((prevOrderItems) => {
        const updatedOrderItems = prevOrderItems.filter((_, i) => i !== index);
        form.setValue(
          "items",
          form.getValues("items").filter((_, i) => i !== index)
        );
        return updatedOrderItems;
      });
    } else {
      toast({
        title: "Cannot remove the last item",
        description: "At least one item must remain in the order.",
        variant: "destructive",
      });
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
        />
      </form>
    </Form>
  );
}
