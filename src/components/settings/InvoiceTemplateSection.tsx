import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "./settingsTypes";

interface InvoiceTemplateSectionProps {
  form: UseFormReturn<SettingsFormValues>;
}

export function InvoiceTemplateSection({ form }: InvoiceTemplateSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Invoice Template Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize how your invoices look
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="invoiceHeaderText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Text</FormLabel>
              <Input {...field} placeholder="Enter header text" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoiceFooterText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Footer Text</FormLabel>
              <Textarea {...field} placeholder="Enter footer text" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showBusinessAddress"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Business Address</FormLabel>
              </div>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showInvoiceDueDate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Due Date</FormLabel>
              </div>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}