import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { BaseUserFormData } from "../../schemas/sharedFormSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AddressFields } from "../AddressFields";

interface AddressInformationSectionProps {
  form: UseFormReturn<BaseUserFormData>;
}

export function AddressInformationSection({
  form,
}: AddressInformationSectionProps) {
  const sameAsShipping = form.watch("sameAsShipping");
  const billingAddress = form.watch("billingAddress");
  const freeShipping = form.watch("freeShipping") || false; // Ensure boolean value

  useEffect(() => {
    if (sameAsShipping) {
      form.setValue("shippingAddress", billingAddress);
    }
  }, [sameAsShipping, billingAddress, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddressFields form={form} type="billing" />

        <FormField
          control={form.control}
          name="sameAsShipping"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel
                  htmlFor="same-as-shipping-switch"
                  className="text-base"
                >
                  Same as Shipping
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  id="same-as-shipping-switch"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Use billing address for shipping"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="freeShipping"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel htmlFor="free-shipping-switch" className="text-base">
                  Free Shipping
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  id="free-shipping-switch"
                  checked={field.value ?? false} // Ensure it's always a boolean
                  onCheckedChange={field.onChange}
                  aria-label="Enable free shipping"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order_pay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel htmlFor="order_pay-switch" className="text-base">
                  Order Pay
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  id="order_pay-switch"
                  checked={field.value ?? false} // Ensure it's always a boolean
                  onCheckedChange={field.onChange}
                  aria-label="Enable free shipping"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <AddressFields form={form} type="shipping" />
      </CardContent>
    </Card>
  );
}
