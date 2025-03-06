import { UseFormReturn } from "react-hook-form";
import { AddressInput } from "./address/AddressInput";
import { StateSelect } from "./address/StateSelect";

interface AddressFieldsProps {
  form: UseFormReturn<any>;
  type: "billing" | "shipping" | "address";
  prefix?: string;
}

export function AddressFields({ form, type, prefix = "" }: AddressFieldsProps) {
  const fieldName = (field: string) => `${prefix ? `${prefix}.` : ""}${type}Address.${field}`;

  return (
    <div className="space-y-4">
      <AddressInput
        form={form}
        fieldName={fieldName("attention")}
        label="Attention"
      />

      <AddressInput
        form={form}
        fieldName={fieldName("street1")}
        label="Street Address 1"
      />

      <AddressInput
        form={form}
        fieldName={fieldName("street2")}
        label="Street Address 2"
      />

      <div className="grid grid-cols-2 gap-4">
        <AddressInput form={form} fieldName={fieldName("city")} label="City" />
        <StateSelect form={form} fieldName={fieldName("state")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AddressInput
          form={form}
          fieldName={fieldName("zip_code")}
          label="ZIP Code"
        />

        <AddressInput
          form={form}
          fieldName={fieldName("phone")}
          label="Phone"
          type="tel"
        />
      </div>

      <AddressInput
        form={form}
        fieldName={fieldName("faxNumber")}
        label="Fax Number"
        type="tel"
      />
    </div>
  );
}
