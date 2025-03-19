import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { AddressInput } from "./address/AddressInput";
import { StateSelect } from "./address/StateSelect";

declare global {
  interface Window {
    google: any;
  }
}

interface AddressFieldsProps {
  form: UseFormReturn<any>;
  type?: "billing" | "shipping" | "address";
  prefix?: string;
}

export function AddressFields({ form, type, prefix = "" }: AddressFieldsProps) {
  const fieldName = (field: string) =>
    `${prefix ? `${prefix}.` : ""}${type}Address.${field}`;

  const [street1Suggestions, setStreet1Suggestions] = useState<any[]>([]);
  const [street2Suggestions, setStreet2Suggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!window.google) {
      console.error("Google Maps API not loaded");
    }
  }, []);

  const fetchSuggestions = (value: string, setSuggestions: any) => {
    if (!value || !window.google) {
      setSuggestions([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: value }, (predictions: any) => {
      setSuggestions(predictions || []);
    });
  };

  return (
    <div className="space-y-4 relative">
      <AddressInput form={form} fieldName={fieldName("attention")} label="Attention" />

      {/* Street 1 with Autocomplete */}
      <div className="relative">
        <AddressInput
          form={form}
          fieldName={fieldName("street1")}
          label="Street Address 1 *"
          {...form.register(fieldName("street1"), {
            onChange: (e) => fetchSuggestions(e.target.value, setStreet1Suggestions),
          })}
        />
        {street1Suggestions.length > 0 && (
          <ul className="absolute left-0 w-full bg-white border shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
            {street1Suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-lg"
                onClick={() => {
                  form.setValue(fieldName("street1"), suggestion.description);
                  setStreet1Suggestions([]);
                }}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Street 2 with Autocomplete */}
      <div className="relative">
        <AddressInput
          form={form}
          fieldName={fieldName("street2")}
          label="Street Address 2"
          {...form.register(fieldName("street2"), {
            onChange: (e) => fetchSuggestions(e.target.value, setStreet2Suggestions),
          })}
        />
        {street2Suggestions.length > 0 && (
          <ul className="absolute left-0 w-full bg-white border shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
            {street2Suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-lg"
                onClick={() => {
                  form.setValue(fieldName("street2"), suggestion.description);
                  setStreet2Suggestions([]);
                }}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AddressInput form={form} fieldName={fieldName("city")} label="City *" />
        <StateSelect form={form} fieldName={fieldName("state")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AddressInput form={form} fieldName={fieldName("zip_code")} label="ZIP Code *" />
        <AddressInput form={form} fieldName={fieldName("phone")} label="Phone" type="tel" />
      </div>

      <AddressInput form={form} fieldName={fieldName("faxNumber")} label="Fax Number" type="tel" />
    </div>
  );
}
