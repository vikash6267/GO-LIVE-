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
import axios from "../../../axiosconfig";
import { InvoiceStatus, PaymentMethod } from "../invoices/types/invoice.types";
import CreateOrderPaymentForm from "../CreateOrderPayment";
import { pid } from "process";
import CartItemsPricing from "../CartItemsPricing";
import CustomProductForm from "./Customitems";

export interface CreateOrderFormProps {
  initialData?: Partial<OrderFormValues>;
  onFormChange?: (data: Partial<OrderFormValues>) => void;
  isEditing?: boolean;
  poIs?: boolean;
  use?: string;
  locationId?: any;

}

export function CreateOrderForm({
  initialData,
  onFormChange,
  isEditing,
  use,
  locationId,
  poIs = false
}: CreateOrderFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const userProfile = useSelector(selectUserProfile);
  const { cartItems, clearCart, addToCart } = useCart();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isCus, setIsCus] = useState<boolean>(false);
  const [isPriceChange, setIsPriceChange] = useState<boolean>(false);

  console.log(cartItems);
  const [pId, setPId] = useState(
    initialData?.customerInfo.cusid || ""
  );
  const userTypeRole = sessionStorage.getItem('userType');
  console.log(initialData)
  useEffect(() => {
    setPId(initialData?.customerInfo.cusid || initialData?.customer);
  }, [initialData, userProfile]);

  const totalShippingCost =
    sessionStorage.getItem("shipping") == "true"
      ? 0
      : Math.max(...cartItems.map((item) => item.shipping_cost || 0));

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      id: "", // ✅ Initialize as empty
      customer: pId || userProfile?.id || "",
      date: new Date().toISOString(),
      total: "0",
      status: "new",
      payment_status: "unpaid",
      customization: isCus,
      poAccept: !poIs,

      customerInfo: {
        name: initialData?.customerInfo?.name || `${initialData?.customerInfo?.name || ""} ${userProfile?.last_name || ""}`,
        email: initialData?.customerInfo?.email || "",
        phone: userProfile?.mobile_phone || "",
        type: "Pharmacy",
        address: {
          street: initialData?.customerInfo?.address?.street || userProfile?.company_name || "",
          city: initialData?.customerInfo?.address?.city || userProfile?.city || "",
          state: initialData?.customerInfo?.address?.state || userProfile?.state || "",
          zip_code: initialData?.customerInfo?.address?.zip_code || userProfile?.zip_code || "",
        },
      },

      shippingAddress: {
        fullName: initialData?.customerInfo?.name || `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`,
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
      items: initialData.items || cartItems,
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

  // ✅ Fetch and update order ID asynchronously after form initialization
  // useEffect(() => {
  //   const fetchOrderId = async () => {
  //     const orderId = await generateOrderId();
  //     form.setValue("id", orderId); // ✅ Set order ID in form
  //   };

  //   fetchOrderId();
  // }, [form.setValue]);

  // Load pending order items from localStorage if they exist
  useEffect(() => {
    const pendingOrderItems = localStorage.getItem("cartItems");
    if (pendingOrderItems) {
      const items = JSON.parse(pendingOrderItems);
      form.setValue("items", items);
      setOrderItems(items.map((_, index) => ({ id: index + 1 })));
      localStorage.removeItem("pendingOrderItems"); // Clear after loading
    }
  }, [form, cartItems]);

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
    console.log("hellllo");





    try {
      setIsSubmitting(true);
      console.log("Starting order submission:", data);
      const taxper = sessionStorage.getItem("taxper")

      // Validate order items
      validateOrderItems(data.items);


      // Calculate order total
      const calculatedTotal = calculateOrderTotal(
        cartItems,
        totalShippingCost || 0
      );



      const newtax = ((calculatedTotal - totalShippingCost) * Number(taxper)) / 100;


      if (userProfile?.id == null) {
        toast({
          title: "User profile not found",
          description: "Please log in to create an order.",
          duration: 5000,
          variant: "destructive",
        });
        return;
      }


      const defaultEstimatedDelivery = new Date();
      defaultEstimatedDelivery.setDate(defaultEstimatedDelivery.getDate() + 10);

      console.log(pId)

      const generateUniqueOrderNumber = () => {
        const timestamp = Date.now().toString().slice(-5); // Last 5 digits of time
        const random = Math.floor(100 + Math.random() * 900); // 3 digit random number
        return `PO-${timestamp}${random}`; // Total 8 digits after 'PO-'
      };

      // const orderNumber = "DEV-0091234";
      const orderNumber = poIs ? generateUniqueOrderNumber() : await generateOrderId();

      if (!userProfile?.id) return
      let profileID = userProfile?.id

      sessionStorage.getItem('userType') === "admin" ? profileID = data.customer : userProfile?.id
      sessionStorage.getItem('userType') === "group" ? profileID = pId : userProfile?.id
      console.log(profileID)

      //  const { data:profileData1, error:profileEror1 } = await supabase
      //               .from("profiles")
      //               .select()
      //               .eq("id", profileID)
      //               .maybeSingle();

      //             if (profileEror1) {
      //               console.error("🚨 Supabase Fetch Error:", profileEror1);
      //               return;
      //             }
      //             console.log(profileData1)
      //             return
      // Prepare order data
      const orderData = {
        order_number: orderNumber,
        profile_id: profileID,
        status: data.status,
        total_amount: calculatedTotal + newtax,
        shipping_cost: totalShippingCost || 0,
        tax_amount: newtax,
        customization: isCus,
        items: data.items,
        notes: data.specialInstructions,
        shipping_method: data.shipping?.method,
        customerInfo: data.customerInfo,
        shippingAddress: data.shippingAddress,
        tracking_number: data.shipping?.trackingNumber,
        estimated_delivery:
          data.shipping?.estimatedDelivery ||
          defaultEstimatedDelivery.toISOString(),
        location_id: pId,
        poAccept: !poIs
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

      console.log(orderResponse);
      const newOrder = orderResponse[0];
      console.log("Order saved:", newOrder);

      if (!poIs) {
        const year = new Date().getFullYear(); // Get current year (e.g., 2025)


        const { data: inData, error: erroIn } = await supabase
          .from("centerize_data")
          .select("id, invoice_no, invoice_start")
          .order("id", { ascending: false }) // Get latest order
          .limit(1);

        if (erroIn) {
          console.error("🚨 Supabase Fetch Error:", erroIn);
          return null;
        }

        let newInvNo = 1; // Default to 1 if no previous order exists
        let invoiceStart = "INV"; // Default order prefix


        if (inData && inData.length > 0) {
          newInvNo = (inData[0].invoice_no || 0) + 1; // Increment last order number
          invoiceStart = inData[0].invoice_start || "INV"; // Use existing order_start
        }


        const invoiceNumber = `${invoiceStart}-${year}${newInvNo.toString().padStart(6, "0")}`;
        // const invoiceNumber = "DEV-0091234";



        const { error: updateError } = await supabase
          .from("centerize_data")
          .update({ invoice_no: newInvNo }) // Correct update syntax
          .eq("id", inData[0]?.id); // Update only the latest record

        if (updateError) {
          console.error("🚨 Supabase Update Error:", updateError);
        } else {
          console.log("✅ Order No Updated to:", newInvNo);
        }

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
          amount: parseFloat(calculatedTotal + newtax) || 0,
          tax_amount: orderData.tax_amount || 0,
          total_amount: parseFloat(calculatedTotal + newtax),
          payment_status: newOrder.payment_status,
          payment_method: newOrder.paymentMethod as PaymentMethod,
          payment_notes: newOrder.notes || null,
          items: newOrder.items || [],
          customer_info: newOrder.customerInfo || {
            name: newOrder.customerInfo?.name,
            email: newOrder.customerInfo?.email || "",
            phone: newOrder.customerInfo?.phone || "",
          },
          shipping_info: orderData.shippingAddress || {},
          shippin_cost: totalShippingCost,
          subtotal:
            calculatedTotal + newtax + (isCus ? 0.5 : 0) ||
            parseFloat(calculatedTotal + newtax + (isCus ? 0.5 : 0)),
        };


        const { invoicedata2, error } = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single();

        if (error) {
          console.error("Error creating invoice:", error);
          throw error;
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





        const { data: orderResponse2, error: orderError2 } = await supabase
          .from("orders")
          .select()
          .eq("id", newOrder.id);

        if (orderError2) {
          console.error("Order creation error:", orderError2);
          throw new Error(orderError2.message);
        }


        const { data: profileData, error: profileEror } = await supabase
          .from("profiles")
          .select()
          .eq("id", newOrder.profile_id)
          .maybeSingle();

        if (profileEror) {
          console.error("🚨 Supabase Fetch Error:", profileEror);
          return;
        }
        if (profileData.email_notifaction) {
          try {
            await axios.post("/order-place", newOrder);
            console.log("Order status sent successfully to backend.");
          } catch (apiError) {
            console.error("Failed to send order status to backend:", apiError);
          }

        }
      }

      // Reset form and local state
      window.location.reload();

      localStorage.removeItem("cart");

      toast({
        title: "Order Created Successfully",
        description: `Order ID: ${newOrder.id} has been created.`,
      });


      form.reset();
      // setOrderItems([{ id: 1 }]);

      const userType = sessionStorage.getItem('userType');

      if (userType.toLocaleLowerCase() === 'group') {
        navigate("/group/orders");

      }
      if (userType.toLocaleLowerCase() === 'pharmacy') {
        navigate("/pharmacy/orders");

      }
      if (userType.toLocaleLowerCase() === 'admin') {
        if (poIs) {
          navigate("/admin/po", { state: { createOrder: false } });
        } else {
          navigate("/admin/orders", { state: { createOrder: false } });
        }
      }


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

  useEffect(() => {
    const VVV = form.getValues();
    console.log(VVV);
  }, []);



  const [isCustom, setIsCustom] = useState(false)
  return (
    <>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomerSelectionField
            form={form}
            initialData={initialData}
            locationId={locationId}
          />


          <div className="">

            {userTypeRole === "admin" && <div className="flex justify-end w-full gap-5">
              <p
                onClick={(e) => {
                  e.preventDefault(); // Form submit hone se rokne ke liye
                  setIsPriceChange(!isPriceChange);
                }}
                className="cursor-pointer px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 active:scale-95 transition-all inline-block text-center"
              >
                {isPriceChange ? "Close Edit Price" : "Edit Price"}
              </p>

              <div>
                <p onClick={() => setIsCustom(true)} className="p-2 cursor-pointer bg-blue-600 text-white rounded">
                  Add Items
                </p>

                <CustomProductForm isOpen={isCustom} onClose={() => setIsCustom(false)} isEditing={isEditing} form={form} />
              </div>

            </div>}



            {
              isPriceChange && <CartItemsPricing />
            }

            <OrderItemsSection
              orderItems={form.getValues('items') || cartItems}
              form={form}
              setIsCus={setIsCus}
              isCus={isCus}

            />
          </div>
          <ShippingSection form={form} />

          {!poIs && <PaymentSection form={form} />}

          <OrderFormActions
            orderData={form.getValues()}
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            isEditing={isEditing}
            setModalIsOpen={setModalIsOpen}
            setIsCus={setIsCus}
            isCus={isCus}
            form={form}
            poIs={poIs}
          />
        </form>
      </Form>
      {modalIsOpen && (
        <CreateOrderPaymentForm
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          formDataa={form.getValues()}
          form={form}
          pId={pId}
          setIsCus={setIsCus}
          isCus={isCus}
        />
      )}
    </>
  );
}
