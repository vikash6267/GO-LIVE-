import Select from "react-select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../CreateGroupPricingDialog";

interface GroupPharmacyFieldsProps {
  form: UseFormReturn<FormValues>;
  groups: Array<{ id: string; name: string }>;
  pharmacies: Array<{ id: string; name: string }>;
}

export function GroupPharmacyFields({ form, groups, pharmacies }: GroupPharmacyFieldsProps) {
  return (
    <>
      {/* Multi-select for Groups */}
      <FormField
        control={form.control}
        name="group"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Group (Required)</FormLabel>
            <FormControl>
              <Select
                isMulti
                options={groups.map((group) => ({ value: group.id, label: group.name }))}
                value={groups.filter((group) => field.value?.includes(group.id)).map((group) => ({ value: group.id, label: group.name }))}
                onChange={(selectedOptions) => field.onChange(selectedOptions.map((option) => option.value))}
                placeholder="Select groups"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Multi-select for Pharmacies */}
      {/* <FormField
        control={form.control}
        name="pharmacy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pharmacy (Optional)</FormLabel>
            <FormControl>
              <Select
                isMulti
                options={pharmacies.map((pharmacy) => ({ value: pharmacy.id, label: pharmacy.name }))}
                value={pharmacies.filter((pharmacy) => field.value?.includes(pharmacy.id)).map((pharmacy) => ({ value: pharmacy.id, label: pharmacy.name }))}
                onChange={(selectedOptions) => field.onChange(selectedOptions.map((option) => option.value))}
                placeholder="Select pharmacies"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
    </>
  );
}
