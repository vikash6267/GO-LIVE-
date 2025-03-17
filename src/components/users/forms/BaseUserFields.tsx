import { UseFormReturn } from "react-hook-form";
import { BaseUserFormData } from "../schemas/sharedFormSchema";
import { BasicInformationSection } from "./sections/BasicInformationSection";
import { ContactInformationSection } from "./sections/ContactInformationSection";
import { AddressInformationSection } from "./sections/AddressInformationSection";
import { CustomerTypeFields } from "./sections/CustomerTypeFields";
import { TaxAndDocumentsSection } from "./sections/TaxAndDocumentsSection";

interface BaseUserFieldsProps {
  form: UseFormReturn<BaseUserFormData>;
  self?:boolean
}

export function BaseUserFields({ form , self=false}: BaseUserFieldsProps) {
  const customerType = form.watch("type") as "pharmacy" | "hospital" | "group";

  return (
    <div className="space-y-6">
      <BasicInformationSection form={form}  self={self}/>
      {customerType && <CustomerTypeFields form={form} type={customerType} />}
      <ContactInformationSection form={form} />
      <TaxAndDocumentsSection form={form} />
      <AddressInformationSection form={form} self={self} />
    </div>
  );
}