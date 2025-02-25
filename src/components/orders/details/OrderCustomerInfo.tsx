import { OrderFormValues } from "../schemas/orderSchema";

interface OrderCustomerInfoProps {
  customerInfo?: OrderFormValues["customerInfo"];
}

export function OrderCustomerInfo({ customerInfo }: OrderCustomerInfoProps) {
  if (!customerInfo) {
    return <div>No customer information available</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Customer Information</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>Name: {customerInfo.name || "N/A"}</p>
        <p>Email: {customerInfo.email || "N/A"}</p>
        <p>Phone: {customerInfo.phone || "N/A"}</p>
        <p>Type: {customerInfo.type || "N/A"}</p>
      </div>
      <div className="text-sm">
        <p>Address: {customerInfo.address?.street || "N/A"}</p>
        <p>
          {customerInfo.address?.city && customerInfo.address?.state
            ? `${customerInfo.address.city}, ${customerInfo.address.state} ${
                customerInfo.address.zip_code || ""
              }`
            : "No address provided"}
        </p>
      </div>
    </div>
  );
}
