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
import { useNavigate } from "react-router-dom";
import { useOrderManagement } from "./orders/hooks/useOrderManagement";

Modal.setAppElement(document.getElementById("body"));

const PaymentForm = ({
  modalIsOpen,
  setModalIsOpen,
  customer,
  amountP,
  orderId,
  orders,
  payNow = false,
  
 
}) => {
  const [paymentType, setPaymentType] = useState("credit_card");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const [notes, setNotes] = useState("")
  const {

    loadOrders
  } = useOrderManagement();

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
    notes: "",
  });

  useEffect(() => {
    console.log(orders);
    if (customer) {
      setFormData((prevData) => ({
        ...prevData,
        nameOnAccount: customer.name || "",
        cardholderName: customer.name || "",
        address: customer.address?.street || "",
        city: customer.address?.city || "",
        state: customer.address?.state || "",
        zip: customer.address?.zip_code || "",
        email: customer.email || "",
        phone: customer.phone || "",
        amount: amountP || 0,
      }));
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    if (paymentType === "manaul_payemnt") {
      const { data:dateOrder , error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid", // Use correct column name
          notes: formData.notes, // Use correct column name

          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select("*")
        .maybeSingle(); 
        

      if (updateError) throw updateError;

      const { data, error } = await supabase
        .from("invoices")
        .update({
          payment_status: "paid", // Use correct column name
          updated_at: new Date().toISOString(),
          payment_method: "manual",
          payment_notes: formData.notes, // Use correct column name


        })
        .eq("order_id", orderId)
        .select("*"); 


      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }

      console.log('Invoice created successfully:', data);
      setModalIsOpen(false)
      toast({
        title: "Payment Successfull",
        description: "",
      });
      window.location.reload();

      return
    }

    const { data, error } = await supabase
  .from("invoices")
  .select("*")
  .eq("order_id", orderId)
  .single();


  console.log(data)
  
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
          invoiceNumber:data.invoice_number
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
          invoiceNumber:data.invoice_number

        };

    try {
      const response = await axios.post("/pay", paymentData);
      // const response = {
      //   status:200,
      //   data:{
      //     transactionId:23456789,
      //     message:"hello"
      //   }
      // }
      if (response.status === 200) {


     
        
        
        const { data:dateOrder, error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid", // Use correct column name
            updated_at: new Date().toISOString(),
         
          })
          .eq("id", orderId)
          .select("*")
        .maybeSingle(); 
          

        if (updateError) throw updateError;


        try {
        
            
          const response2 = await axios.post("/pay-successfull", {
            name: customer.name || "N/A",
            email: customer.email,
            orderNumber:dateOrder.order_number ,
            transactionId:response?.data.transactionId || "1234"
            
          });
        
          console.log("Payment Successful:", response2.data);
      
         
        } catch (error) {
          console.error("Error in user verification:", error.response?.data || error.message);
        }

        const { data, error } = await supabase
          .from("invoices")
          .update({
            payment_status: "paid", // Use correct column name
            updated_at: new Date().toISOString(),
               payment_transication:response?.data?.transactionId || "",
            payment_method: "card"
          })
          .eq("order_id", orderId);


        if (error) {
          console.error('Error creating invoice:', error);
          throw error;
        }

        console.log('Invoice created successfully:', data);


        if (payNow) {
          navigate("/pharmacy/orders");

        }

        setModalIsOpen(false)
        toast({
          title: "Payment Successfull",
          description: response.data.message,
        });
        window.location.reload();

        setTimeout(() => {
          if (payNow) {
            navigate("/pharmacy/orders");

          };
        }, 500);



      } else {
        console.log(response)
        setLoading(false)

      }
    } catch (error) {
      setLoading(false)

      console.log(error);
      toast({
        title: "Payment failed",
        description: error.response.data.message || "Failed ",
        variant:"destructive"
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen z-[99999]">
      <Modal
        isOpen={modalIsOpen}
        shouldCloseOnOverlayClick={false} // ✅ Yahan false karein
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto mt-20 z-[99] max-h-[80vh] overflow-y-scroll "
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99] pointer-events-auto" // <-- Yaha change karein
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
          {
  sessionStorage.getItem('userType')?.toLocaleLowerCase() === "admin" &&

            <option value="manaul_payemnt">Manual Payment</option>
          }
          {/* <option value="ach">Bank Transfer</option> */}
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
            paymentType === "manaul_payemnt" ? (<>

              <div className="relative">

                <input
                  type="text"
                  name="notes"
                  placeholder="Notes"
                  onChange={handleChange}
                  value={formData.notes}
                  required
                  className="border p-2 w-full rounded pl-10"
                />
              </div>

            </>) : (
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
            )
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

export default PaymentForm;
