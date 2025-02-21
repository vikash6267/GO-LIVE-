import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsFormValues } from "./settingsTypes";

interface InvoiceSectionProps {
  form: UseFormReturn<SettingsFormValues>;
}

export function InvoiceSection({ form }: InvoiceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoicePrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Prefix</FormLabel>
                <FormControl>
                  <Input placeholder="INV" {...field} />
                </FormControl>
                <FormDescription>
                  Prefix added to invoice numbers (e.g., INV-1001)
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextInvoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Invoice Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  The number to be used for your next invoice
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="invoiceDueDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Due Days</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Number of days until invoice payment is due
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoiceNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Invoice Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter default notes to appear on invoices..."
                  className="h-20"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                These notes will appear at the bottom of every invoice
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showLogo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Logo on Invoices</FormLabel>
                <FormDescription>
                  Display your business logo on invoice documents
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}