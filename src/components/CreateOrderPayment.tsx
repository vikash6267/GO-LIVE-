import { useEffect, useState } from "react";
import Modal from "react-modal";
import axios from "../../axiosconfig";
import {
  CreditCard,
  Landmark,
  User,
  Hash,
  MapPin,
  Building,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateOrderTotal, generateOrderId } from "./orders/utils/orderUtils";
import { useCart } from "@/hooks/use-cart";
import { validateOrderItems } from "./orders/form/OrderFormValidation";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/selectors/userSelectors";
import { InvoiceStatus, PaymentMethod } from "./invoices/types/invoice.types";
import { useNavigate } from "react-router-dom";

Modal.setAppElement(document.getElementById("body"));

const CreateOrderPaymentForm = ({
  modalIsOpen,
  setModalIsOpen,
  form,
  formDataa,
  pId

}) => {
  const [paymentType, setPaymentType] = useState("credit_card");
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const userProfile = useSelector(selectUserProfile);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state

  const [formData, setFormData] = useState({
    amount: 0,
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    cardholderName: "",
    accountType: "",
    routingNumber: "",
    accountNumber: "",
    nameOnAccount: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });


  const totalShippingCost =
    sessionStorage.getItem("shipping") == "true"
      ? 0
      : Math.max(...cartItems.map((item) => item.shipping_cost || 0));



  useEffect(() => {
    console.log(formDataa);
    if (formDataa) {
      setFormData((prevData) => ({
        ...prevData,
        nameOnAccount: formDataa.customerInfo.name || "",
        cardholderName: formDataa.customerInfo.name || "",
        address: formDataa.customerInfo.address?.street || "",
        city: formDataa.customerInfo.address?.city || "",
        state: formDataa.customerInfo.address?.state || "",
        zip: formDataa.customerInfo.address?.zip_code || "",
        email: formDataa.customerInfo.email || "",
        phone: formDataa.customerInfo.phone || "",
        amount: calculateOrderTotal(
          formDataa.items,
          totalShippingCost || 0
        )
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    const paymentData =
      paymentType === "credit_card"
        ? {
          paymentType,
          amount: formData.amount,
          cardNumber: formData.cardNumber,
          expirationDate: formData.expirationDate,
          cvv: formData.cvv,
          cardholderName: formData.cardholderName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        }
        : {
          paymentType,
          amount: formData.amount,
          accountType: formData.accountType,
          routingNumber: formData.routingNumber,
          accountNumber: formData.accountNumber,
          nameOnAccount: formData.nameOnAccount,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        };

    try {
      const response = await axios.post("/pay", paymentData);
      if (response.status === 200) {
        try {
          const data = formDataa
          
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
            order_number: generateOrderId(),
            profile_id: pId || userProfile.id,
            status: data.status,
            total_amount: calculatedTotal,
            shipping_cost: data.shipping?.cost || 0,
            tax_amount: 0,
            items: data.items,
          payment_status: "paid", // Use correct column name

            notes: data.specialInstructions,
            shipping_method: data.shipping?.method,
            customerInfo: data.customerInfo,
            shippingAddress: data.shippingAddress,
            tracking_number: data.shipping?.trackingNumber,
            estimated_delivery:
              data.shipping?.estimatedDelivery ||
              defaultEstimatedDelivery.toISOString(),
          };
    
          console.log(orderData)
    
    
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
          payment_status: "paid", // Use correct column name

        
            payment_method: newOrder.paymentMethod as PaymentMethod,
            payment_notes: newOrder.notes || null,
            items: newOrder.items || [],
            customer_info: newOrder.customerInfo || {
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
        }

      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Payment failed",
        description: error.data.message,
      });
    }
    setLoading(false)
  };

  return (
    <div className="flex justify-center items-center min-h-screen z-[99999]">
      <Modal
        isOpen={modalIsOpen}
        shouldCloseOnOverlayClick={false} // ✅ Yahan false karein
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto mt-20 z-[999999] max-h-[80vh] overflow-y-scroll "
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999] pointer-events-auto" // <-- Yaha change karein
      >
        <button
          onClick={() => setModalIsOpen(false)}
          className="absolute top-3 right-3 bg-gray-300 hover:bg-gray-400 text-black rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Make a Payment</h2>
        <select
          onChange={(e) => setPaymentType(e.target.value)}
          value={paymentType}
          className="border p-2 w-full mb-3 rounded"
        >
          <option value="credit_card">Credit Card</option>
          <option value="ach">ACH (Bank Transfer)</option>
        </select>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              readOnly
              name="amount"
              placeholder="Amount"
              onChange={handleChange}
              value={formData.amount}
              required
              className="border p-2 w-full rounded pl-10 cursor-not-allowed"
            />
          </div>

          {paymentType === "credit_card" ? (
            <>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number"
                  onChange={handleChange}
                  value={formData.cardNumber}
                  required
                  className="border p-2 w-full rounded pl-10 bg-white text-black"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="expirationDate"
                  placeholder="MMYY"
                  onChange={handleChange}
                  value={formData.expirationDate}
                  required
                  className="border p-2 w-full rounded"
                />
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  onChange={handleChange}
                  value={formData.cvv}
                  required
                  className="border p-2 w-full rounded"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="cardholderName"
                  placeholder="Cardholder Name"
                  onChange={handleChange}
                  value={formData.cardholderName}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  onChange={handleChange}
                  value={formData.address}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                  value={formData.city}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  onChange={handleChange}
                  value={formData.state}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                onChange={handleChange}
                value={formData.zip}
                required
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                onChange={handleChange}
                value={formData.country}
                required
                className="border p-2 w-full rounded"
              />
            </>
          ) : (
            <>
              <select
                name="accountType"
                onChange={handleChange}
                value={formData.accountType}
                className="border p-2 w-full rounded"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
              <div className="relative">
                <Landmark className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="routingNumber"
                  placeholder="Routing Number"
                  onChange={handleChange}
                  value={formData.routingNumber}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Account Number"
                  onChange={handleChange}
                  value={formData.accountNumber}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="nameOnAccount"
                  placeholder="Name on Account"
                  onChange={handleChange}
                  value={formData.nameOnAccount}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  onChange={handleChange}
                  value={formData.address}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                  value={formData.city}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  onChange={handleChange}
                  value={formData.state}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                onChange={handleChange}
                value={formData.zip}
                required
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                onChange={handleChange}
                value={formData.country}
                required
                className="border p-2 w-full rounded"
              />
            </>
          )}

<div className="flex gap-2 justify-between px-2">
  <button
    type="submit"
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full flex items-center justify-center"
    disabled={loading} // Disable button when loading
  >
    {loading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        Processing...
      </>
    ) : (
      "Confirm Payment"
    )}
  </button>
</div>

        </form>
      </Modal>
    </div>
  );
};

export default CreateOrderPaymentForm;
