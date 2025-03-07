import { supabase } from "@/supabaseClient";
import { BaseUserFormData } from "../../schemas/sharedFormSchema";
import { toast } from "@/hooks/use-toast";

export const fetchUserProfile = async (userId: string) => {
  console.log("Fetching user data for ID:", userId);

  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.error("Authentication Error: No active session found");
      throw new Error("No active session found");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Database Error - Failed to fetch profile:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.error("Data Error: User profile not found for ID:", userId);
      throw new Error("User profile not found");
    }

    console.log("Successfully fetched profile:", data);
    return data;
  } catch (error: any) {
    console.error("Error in fetchUserProfile:", error);
    throw new Error(error.message || "Failed to fetch user profile");
  }
};

export const updateUserProfile = async (
  userId: string,
  values: BaseUserFormData
) => {
  console.log("Starting profile update with values:", values);
  console.log("Updating user ID:", userId);

  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.error(
        "Authentication Error: No active session found during update"
      );
      throw new Error("No active session found");
    }

    // Map form values to profile data structure
    const profileData = {
      first_name: values.firstName?.trim(),
      last_name: values.lastName?.trim(),
      email: values.email?.trim(),
      type: values.type,
      status: values.status,
      role: values.role,
      company_name: values.companyName?.trim() || null,
      pharmacy_license: values.pharmacyLicense?.trim() || null,
      display_name: values.displayName?.trim() || null,
      work_phone: values.workPhone?.trim() || null,
      mobile_phone: values.mobilePhone?.trim() || null,
      billing_address: values.billingAddress || {},
      shipping_address: values.shippingAddress || {},
      locations: values.locations || [{}],
      same_as_shipping: values.sameAsShipping || false,
      freeShipping: values.freeShipping || false,
      tax_preference: values.taxPreference || "Taxable",
      currency: values.currency || "USD",
      payment_terms: values.paymentTerms || "DueOnReceipt",
      enable_portal: values.enablePortal || false,
      portal_language: values.portalLanguage || "English",
      updated_at: new Date().toISOString(),
    };

    console.log("Prepared profile data for update:", profileData);

    const { data, error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase update error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
  

      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
      throw new Error(`Database error: ${error.message}`);
    }


        // // ❌ STEP 1: Delete old locations

        // console.log("hello this is location updatation code")
        // const { error: deleteError } = await supabase
        //   .from("locations")
        //   .delete()
        //   .eq("profile_id", userId);
  
        // if (deleteError) {
        //   console.error("Error deleting locations:", deleteError);
        //   toast({
        //     title: "Error",
        //     description: `Failed to delete old locations: ${deleteError.message}`,
        //     variant: "destructive",
        //   });
        //   throw new Error(`Delete error: ${deleteError.message}`);
        // }
  
        // // ✅ STEP 2: Insert new locations
        // if (values.locations && values.locations.length > 0) {
        //   const newLocations = values.locations.map((location) => ({
        //     profile_id: userId,
        //     name: location.name || "",
        //     type: location.type || "branch",
        //     status: location.status || "pending",
        //     address: location.address,
        //     contact_email: location.contactEmail || "",
        //     contact_phone: location.contactPhone || "",
        //   }));
  
        //   const { error: insertError } = await supabase.from("locations").insert(newLocations);
  
        //   if (insertError) {
        //     console.error("Error inserting new locations:", insertError);
        //     toast({
        //       title: "Error",
        //       description: `Failed to add new locations: ${insertError.message}`,
        //       variant: "destructive",
        //     });
        //     throw new Error(`Insert error: ${insertError.message}`);
        //   }
        // }

        

    if (!data) {
      console.error("Update Error: No data returned after update");
      throw new Error("Profile update failed - no data returned");
    }

    console.log("Profile updated successfully:", data);
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
    return data;
  } catch (error: any) {
    console.error("Error in updateUserProfile:", error);
    throw new Error(error.message || "Failed to update profile");
  }
};
