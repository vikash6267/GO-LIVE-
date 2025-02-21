
import { UseFormReturn } from "react-hook-form";
import { BaseUserFormData } from "../../schemas/sharedFormSchema";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AddressFields } from "../AddressFields";

interface AddressInformationSectionProps {
  form: UseFormReturn<BaseUserFormData>;
}

export function AddressInformationSection({ form }: AddressInformationSectionProps) {
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
                  name="same-as-shipping"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Use billing address for shipping"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!form.watch("sameAsShipping") && (
          <AddressFields form={form} type="shipping" />
        )}
      </CardContent>
    </Card>
  );
}
