import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { AddressFields } from "../users/forms/AddressFields";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { selectUserProfile } from "@/store/selectors/userSelectors";
import { useSelector } from "react-redux";

const pharmacySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  license: z.string().min(5, "License number is required"),
  email: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  address: z.object({
    attention: z.string().optional(),
    countryRegion: z.string().optional(),
    street1: z.string().min(2, "Street address is required"),
    street2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip_code: z.string().min(5, "ZIP code is required"),
    phone: z.string().optional(),
    faxNumber: z.string().optional(),
  }),
  addressAddress: z.object({
    attention: z.string().optional(),
    countryRegion: z.string().optional(),
    street1: z.string().min(2, "Street address is required"),
    street2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip_code: z.string().min(5, "ZIP code is required"),
    phone: z.string().optional(),
    faxNumber: z.string().optional(),
  }),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

interface AddPharmacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPharmacyAdded: () => void;
}

export function AddPharmacyModal({
  open,
  onOpenChange,
  onPharmacyAdded,
}: AddPharmacyModalProps) {
  const { toast } = useToast();
  const userProfile = useSelector(selectUserProfile);

  const form = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      name: "",
      license: "",
      email: "",
      phone: "",
      address: {
        attention: "",
        countryRegion: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        zip_code: "",
        phone: "sadfsdf",
        faxNumber: "",
      },
      addressAddress: {
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
    },
  });

const onSubmit = async() => {
  const values = form.getValues()
 
  if (Object.keys(form.formState.errors).length > 0) {
    toast({
      title: "Error",
      description: "Please fix the form errors before submitting.",
      variant: "destructive",
    });
    return;
  }

   if (values) {
      const locationData = {
        profile_id: userProfile.id,
        name: values.name || "",
        type : "branch",
        address: values.address,
        contact_email: values.email || "",
        contact_phone: values.phone || "",
      }
   

     const { error: insertError } = await supabase.from("locations").insert(locationData);

     if (insertError) {
       console.error("Error inserting new locations:", insertError);
       toast({
         title: "Error",
         description: `Failed to add new locations: ${insertError.message}`,
         variant: "destructive",
       });
       throw new Error(`Insert error: ${insertError.message}`);
     }
   }



  toast({
    title: "Pharmacy Added",
    description: `${values.name} has been added to your group successfully`,
  });

  // form.reset();
  // onPharmacyAdded();
  // onOpenChange(false);
};

  console.log("hello")
  useEffect(() => {
    console.log(form.getValues());
  }, [form.watch()]); // ✅ Yeh jab bhi form values change hongi tab trigger hoga
  

  useEffect(() => {
    const addressAddress = form.watch("addressAddress"); // ✅ Efficient way to track changes
    

      form.setValue("address", addressAddress); // ✅ Replace `address` with `addressAddress`
   
  }, [form.watch("addressAddress")]); // ✅ Trigger only when `addressAddress` changes
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Pharmacy</DialogTitle>
          <DialogDescription>
            Add a new pharmacy to your group. Fill in the pharmacy details
            below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] px-6">
          <Form {...form}>
            <form  className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter pharmacy name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter license number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <AddressFields form={form}  type="address"/>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4">
          <Button type="submit" onClick={onSubmit}>
            Add Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}