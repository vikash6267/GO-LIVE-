import { CustomerInfoFields } from "../CustomerInfoFields";
import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { selectUserProfile } from "../../../store/selectors/userSelectors";
import {supabase}  from "@/supabaseClient";

interface CustomerSelectionFieldProps {
  form: UseFormReturn<any>;
}



// Improved customer validation schema
const customerValidationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  type: z.literal("Pharmacy"),
  address: z.object({
    street: z.string().min(5, "Street address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  }),
});

export function CustomerSelectionField({ form }: CustomerSelectionFieldProps) {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const userProfile = useSelector(selectUserProfile);

  const fetchCustomerInfo = async (userId) => {
    try {
      const { data, error } = await supabase.from("profiles").select("first_name, last_name, email, mobile_phone, type, company_name, display_name")
        .eq("status", "active").eq("id",userId).single(); // Fetch only one record for simplicity

      if (error) {
        console.error("Failed to fetch customer information:", error);
        throw new Error("Failed to fetch customer information: " + error.message);
      }

      if (!data || data.length === 0) {
        throw new Error("No customer information found.");
      }
      // console.log("Data",data);
      // const data = userData[0];

      // Map data to the customerInfo schema
      const customerInfo = {
        name: data.display_name || `${data.first_name} ${data.last_name}`,
        email: data.email || "",
        phone: data.mobile_phone || "",
        type: "Pharmacy" as const,
        address: {
          street: data.company_name || "N/A",
          city: "N/A", // Populate with relevant field if available
          state: "N/A", // Populate with relevant field if available
          zipCode: "00000", // Replace with actual data if available
        },
      };

      // const validationResult = customerValidationSchema.safeParse(customerInfo);
      // if (!validationResult.success) {
      //   throw new Error("Invalid customer information");
      // }

      return customerInfo;
    } catch (error) {
      console.error("Error fetching customer info:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load customer information.",
        variant: "destructive",
      });
      return null;
    }
  };

  

  // Set form values when component mounts with validation
  useEffect(() => {
    if (!userProfile?.id) return
    
    const setCustomerInfo = async () => {
      setIsValidating(true);
      try {
        const customerInfo = await fetchCustomerInfo(userProfile?.id);
        if (customerInfo) {
          form.setValue('customerInfo', customerInfo);
        }
      } catch (error) {
        console.error("Error setting customer info:", error);
        toast({
          title: "Validation Error",
          description: "Please ensure all customer information is complete and valid.",
          variant: "destructive",
        });
      } finally {
        setIsValidating(false);
      }
    };

    setCustomerInfo();
  }, [userProfile?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Customer Information</h2>
        {isValidating ? (
          <div className="text-sm text-muted-foreground">Validating customer information...</div>
        ) : (
          <CustomerInfoFields form={form}  />
        )}
      </div>
    </div>
  );
}