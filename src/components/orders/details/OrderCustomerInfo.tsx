import { OrderFormValues } from "../schemas/orderSchema";

interface OrderCustomerInfoProps {
  customerInfo?: OrderFormValues["customerInfo"];
  shippingAddress?: OrderFormValues["shippingAddress"];
}

export function OrderCustomerInfo({ customerInfo,shippingAddress }: OrderCustomerInfoProps) {
  if (!customerInfo) {
    return <div>No customer information available</div>;
  }

  console.log(shippingAddress)
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Billing Information</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>Name: {customerInfo?.name || "N/A"}</p>
        <p>Email: {customerInfo?.email || "N/A"}</p>
        <p>Phone: {customerInfo?.phone || "N/A"}</p>
        <p>Type: {customerInfo?.type || "N/A"}</p>
      </div>
      <div className="text-sm">
        <p>Address: {customerInfo?.address?.street || "N/A"}</p>
        <p>
          {customerInfo.address?.city && customerInfo?.address?.state
            ? `${customerInfo?.address.city}, ${customerInfo?.address.state} ${
                customerInfo?.address.zip_code || ""
              }`
            : "No address provided"}
        </p>
      </div>

      <div>
      <h3 className="font-semibold">Shpping Information</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>Name: {shippingAddress?.fullName || "N/A"}</p>
        <p>Email: {shippingAddress?.email || "N/A"}</p>
        <p>Phone: {shippingAddress?.phone || "N/A"}</p>
    
      </div>
      <div className="text-sm">
        <p>Address: {shippingAddress?.address?.street || "N/A"}</p>
        <p>
          {shippingAddress?.address?.city && shippingAddress?.address?.state
            ? `${shippingAddress?.address?.city}, ${shippingAddress?.address.state} ${
              shippingAddress?.address?.zip_code || ""
              }`
            : "No address provided"}
        </p>
      </div>
      </div>
    </div>
  );
}
