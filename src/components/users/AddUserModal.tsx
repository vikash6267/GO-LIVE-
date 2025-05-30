import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { baseUserSchema, BaseUserFormData } from "./schemas/sharedFormSchema";
import { SharedUserForm } from "./forms/SharedUserForm";
import { supabase } from "@/supabaseClient";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import axios from "../../../axiosconfig"
interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserModal({
  open,
  onOpenChange,
  onUserAdded,
}: AddUserModalProps) {
  const queryClient = useQueryClient(); // ✅ Query Client

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BaseUserFormData>({
    resolver: zodResolver(baseUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      type: "pharmacy",
      status: "active",
      role: "user",
      companyName: "",
      displayName: "",
      workPhone: "",
      mobilePhone: "",
      pharmacyLicense: "",
      groupStation: "",
      taxId: "",
      // documents: [],
      billingAddress: {
        attention: "",
        countryRegion: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        zip_code: "",
        phone: "",
        faxNumber: "",
      },
      shippingAddress: {
        attention: "",
        countryRegion: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        zip_code: "",
        phone: "",
        faxNumber: "",
      },
      sameAsShipping: false,
      freeShipping: false,
      order_pay: false,
      taxPreference: "Taxable",
      currency: "USD",
      paymentTerms: "DueOnReceipt",
      enablePortal: false,
      portalLanguage: "English",
      taxPercantage: "0",
      locations: [
        // ✅ Fix: Change from object `{}` to an array `[]`
        {
          name: "",
          type: "headquarters", // Provide a valid default type
          status: "active", // Provide a valid default status
          address: {
            attention: "",
            countryRegion: "",
            street1: "",
            street2: "",
            city: "",
            state: "",
            zip_code: "",
            phone: "",
            faxNumber: "",
          },
          manager: "",
          contactEmail: "",
          contactPhone: "",
        },
      ],
    },
  });

  const onSubmit = async (values: BaseUserFormData) => {
    try {
      // console.log('Starting customer creation with data:', values);
      setIsSubmitting(true);


      // First check if we have an authenticated session
      // const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // if (sessionError || !session) {
      //   throw new Error('You must be logged in to create a customer');
      // }

      // Check if email already exists
      // const { data: existingUsers, error: checkError } = await supabase
      //   .from('profiles')
      //   .select('id')
      //   .eq('email', values.email.toLowerCase().trim())
      //   .single();

      // if (checkError && checkError.code !== 'PGRST116') {
      //   console.error('Error checking existing user:', checkError);
      //   throw new Error('Error checking existing user');
      // }

      // if (existingUsers) {
      //   console.error('A user with this email already exists:', existingUsers);
      //   throw new Error('A user with this email already exists');
      // }
      // console.log('Attempting to create user with data:', values.email);
      const response = await fetch(
        "https://cfyqeilfmodrbiamqgme.supabase.co/auth/v1/admin/users",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeXFlaWxmbW9kcmJpYW1xZ21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjMzNTUzNSwiZXhwIjoyMDUxOTExNTM1fQ.nOqhABs1EMQHOrNtiGdt6uAxWxGnnGRcWr5dkn_BLr0`, // Use the service role key here
            "Content-Type": "application/json",
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeXFlaWxmbW9kcmJpYW1xZ21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjMzNTUzNSwiZXhwIjoyMDUxOTExNTM1fQ.nOqhABs1EMQHOrNtiGdt6uAxWxGnnGRcWr5dkn_BLr0",
          },
          body: JSON.stringify({
            email: values.email,
            password: "12345678",
            email_confirm: true, // ❗ Set to false so user gets a confirmation email
            type: "pharmacy",
            user_metadata: {
              first_name: values.firstName,
              last_name: values.lastName,
            },
          }),
        }
      );

      const tempUserData = await response.json();
      console.log(tempUserData);
      if (!tempUserData?.id) {
        throw new Error(tempUserData.msg || "Failed To Create Custmore");
      }

      // Generate a new UUID for the user
      // const userId = uuidv4();

      // Format the data for Supabase
      const userData = {
        id: tempUserData?.id,
        first_name: values.firstName,
        last_name: values.lastName,
        // display_name:values.firstName + " " + values.lastName,
        email: values.email.toLowerCase().trim(),
        type: values.type.toLowerCase(),
        status: values.status.toLowerCase(),
        role: values.role.toLowerCase(),
        company_name: values.companyName,
        display_name:
          values.displayName || `${values.firstName} ${values.lastName}`,
        work_phone: values.workPhone,
        mobile_phone: values.mobilePhone,
        pharmacy_license: values.pharmacyLicense,
        group_station: values.groupStation,
        tax_id: values.taxId,
        documents: Array.isArray(values.documents) ? values.documents : [],
        billing_address: values.billingAddress || {},
        shipping_address: values.sameAsShipping
          ? values.billingAddress
          : values.shippingAddress,
        same_as_shipping: values.sameAsShipping,
        freeShipping: values.freeShipping,
        order_pay: values.order_pay,
        tax_preference: values.taxPreference,
        currency: values.currency,
        payment_terms: values.paymentTerms,
        enable_portal: Boolean(values.enablePortal),
        portal_language: values.portalLanguage,
        taxPercantage: values.taxPercantage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        alternative_email: values.alternativeEmail || null,
        website: values.website || null,
        fax_number: values.faxNumber || null,
        contact_person: values.contactPerson || null,
        department: values.department || null,
        notes: values.notes || null,
        preferred_contact_method: values.preferredContactMethod || "email",
        language_preference: values.languagePreference || "English",
        credit_limit: values.creditLimit || null,
        payment_method: values.paymentMethod || null,
        account_status: "active",
        email_notifaction:values.email_notifaction || false,

      };

      // console.log('Attempting to insert user with data:', userData);

      const { error } = await supabase.from("profiles").upsert(userData);


      if(userData.status==="active" && userData.email_notifaction){
        try {
          const response = await axios.post("/active-admin", {
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            admin: true
          });

          const { data: update, error } = await supabase
          .from("profiles")
          .update({ active_notification: true })
          .eq("id", tempUserData?.id); // Corrected eq() usage
        
        if (error) {
          console.error("Error updating profile:", error.message);
       
        } else {
          console.log("Profile updated successfully:", update);
        
        }
        
          console.log("Verification Successful:", response.data);
      
          async function sendResetPasswordLink(email) {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email);
          
            if (error) {
              console.error('Error sending reset password email:', error.message);
            } else {
              console.log('Password reset email sent successfully!', data);
            }
          }
          // sendResetPasswordLink(userData.email)
        } catch (error) {
          console.error("Error in user verification:", error.response?.data || error.message);
        }
      }
        
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .insert([userData])
      //   .select();

      if (error) {
        // console.error('Supabase error creating user:', error);
        throw new Error(error.message);
      }

      // console.log('User created successfully:', data);

      toast({
        title: "Success",
        description: `${values.firstName} ${values.lastName} has been created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      form.reset();
      onUserAdded();
      onOpenChange(false);
    } catch (error: any) {
      // console.error('Detailed error creating customer:', error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer account with the following details.
          </DialogDescription>
        </DialogHeader>
        <SharedUserForm
          form={form}
          onSubmit={onSubmit}
          submitLabel="Create Customer"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
