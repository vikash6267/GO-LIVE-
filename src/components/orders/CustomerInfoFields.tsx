"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { UseFormReturn } from "react-hook-form"

declare global {
  interface Window {
    google: any;
  }
}

interface CustomerInfoFieldsProps {
  form: UseFormReturn<any>
  readOnly?: boolean
}

export function CustomerInfoFields({ form, readOnly = false }: CustomerInfoFieldsProps) {
  const [sameAsCustomer, setSameAsCustomer] = useState(false)
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([])
  const [shippingSuggestions, setShippingSuggestions] = useState<any[]>([])
  const customerAddressInputRef = useRef<HTMLInputElement | null>(null)
  const shippingAddressInputRef = useRef<HTMLInputElement | null>(null)

  const handlePlaceSelected = (place: any, addressType: string) => {
    if (!place || !place.address_components) return

    let city = ""
    let state = ""
    let zipCode = ""
    let street = place.formatted_address?.split(",")[0] || ""
    let companyName = place.name || "" // If company name is part of the place data

    place.address_components.forEach((component: any) => {
      const types = component.types
      if (types.includes("locality")) city = component.long_name
      if (types.includes("administrative_area_level_1")) state = component.short_name
      if (types.includes("postal_code")) zipCode = component.long_name
    })

    const addressField = addressType === "customer" ? "customerInfo" : "shippingAddress"
    form.setValue(`${addressField}.address.street`, street, { shouldValidate: true })
    form.setValue(`${addressField}.address.city`, city, { shouldValidate: true })
    form.setValue(`${addressField}.address.state`, state, { shouldValidate: true })
    form.setValue(`${addressField}.address.zip_code`, zipCode, { shouldValidate: true })
    form.setValue(`${addressField}.address.companyName`, companyName, { shouldValidate: true }) // Set company name if available
  }

  const syncShippingWithCustomer = useCallback(() => {
    const info = form.getValues("customerInfo")
    form.setValue("shippingAddress.fullName", info.name || "", { shouldValidate: true })
    form.setValue("shippingAddress.email", info.email || "", { shouldValidate: true })
    form.setValue("shippingAddress.phone", info.phone || "", { shouldValidate: true })
    form.setValue("shippingAddress.address.street", info.address?.street || "", { shouldValidate: true })
    form.setValue("shippingAddress.address.city", info.address?.city || "", { shouldValidate: true })
    form.setValue("shippingAddress.address.state", info.address?.state || "", { shouldValidate: true })
    form.setValue("shippingAddress.address.zip_code", info.address?.zip_code || "", { shouldValidate: true })
    form.setValue("shippingAddress.address.companyName", info.address?.companyName || "", { shouldValidate: true })
  }, [form])

  const handleToggle = (checked: boolean) => {
    setSameAsCustomer(checked)
    if (checked) syncShippingWithCustomer()
  }

  useEffect(() => {
    if (sameAsCustomer) {
      const subscription = form.watch((_, { name }) => {
        if (name?.startsWith("customerInfo.")) {
          syncShippingWithCustomer()
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [sameAsCustomer, syncShippingWithCustomer, form])

  const handleCustomerAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue("customerInfo.address.street", value, { shouldValidate: true })

    if (value.length > 2 && window.google) {
      const service = new window.google.maps.places.AutocompleteService()
      service.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "in" },
          types: ["geocode", "establishment"], // Include establishments (companies)
        },
        (predictions: any[]) => {
          setCustomerSuggestions(predictions || [])
        }
      )
    } else {
      setCustomerSuggestions([]) // Hide suggestions if input is empty or too short
    }
  }

  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue("shippingAddress.address.street", value, { shouldValidate: true })

    if (value.length > 2 && window.google) {
      const service = new window.google.maps.places.AutocompleteService()
      service.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "in" },
          types: ["geocode", "establishment"], // Include establishments (companies)
        },
        (predictions: any[]) => {
          setShippingSuggestions(predictions || [])
        }
      )
    } else {
      setShippingSuggestions([]) // Hide suggestions if input is empty or too short
    }
  }

  const handleSuggestionClick = (suggestion: any, addressType: string) => {
    const placesService = new window.google.maps.places.PlacesService(document.createElement("div"))
    placesService.getDetails({ placeId: suggestion.place_id }, (place: any) => {
      if (place) handlePlaceSelected(place, addressType)
    })

    if (addressType === "customer") {
      setCustomerSuggestions([]) // Clear suggestions for customer
    } else {
      setShippingSuggestions([]) // Clear suggestions for shipping address
    }
  }

  return (
    <div className="space-y-4">
      {/* Customer Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[ 
          { name: "customerInfo.name", label: "Name" },
          { name: "customerInfo.email", label: "Email", type: "email" },
          { name: "customerInfo.phone", label: "Phone", type: "tel" },
          { name: "customerInfo.address.city", label: "City" },
          { name: "customerInfo.address.state", label: "State" },
          { name: "customerInfo.address.zip_code", label: "Zip Code" },
        ].map(({ name, label, type }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={type || "text"}
                    readOnly={readOnly || sameAsCustomer}
                    className={(readOnly || sameAsCustomer) ? "bg-gray-100" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        {/* Custom Autocomplete Field for Customer Address */}
        <div className="relative col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="customerInfo.address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={handleCustomerAddressChange}
                    readOnly={readOnly || sameAsCustomer}
                    className={(readOnly || sameAsCustomer) ? "bg-gray-100" : ""}
                    ref={customerAddressInputRef}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {customerSuggestions.length > 0 && (
            <ul className="absolute left-0 w-full bg-white border shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
              {customerSuggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm"
                  onClick={() => handleSuggestionClick(suggestion, "customer")}
                >
                  {suggestion.description} {/* Displaying both address and company */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Shipping Info Fields */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="text-lg font-semibold">Shipping Address</h2>
        <div className="flex items-center space-x-2">
          <Switch id="same-as-customer" checked={sameAsCustomer} onCheckedChange={handleToggle} />
          <Label htmlFor="same-as-customer" className="cursor-pointer">Same as Billing Address</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[ 
          { name: "shippingAddress.fullName", label: "Name" },
          { name: "shippingAddress.email", label: "Email", type: "email" },
          { name: "shippingAddress.phone", label: "Phone", type: "tel" },
          { name: "shippingAddress.address.city", label: "City" },
          { name: "shippingAddress.address.state", label: "State" },
          { name: "shippingAddress.address.zip_code", label: "Zip Code" },
        ].map(({ name, label, type }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={type || "text"}
                    readOnly={readOnly || sameAsCustomer}
                    className={(readOnly || sameAsCustomer) ? "bg-gray-100" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        {/* Custom Autocomplete Field for Shipping Address */}
        <div className="relative col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="shippingAddress.address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={handleShippingAddressChange}
                    readOnly={readOnly || sameAsCustomer}
                    className={(readOnly || sameAsCustomer) ? "bg-gray-100" : ""}
                    ref={shippingAddressInputRef}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {shippingSuggestions.length > 0 && (
            <ul className="absolute left-0 w-full bg-white border shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
              {shippingSuggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm"
                  onClick={() => handleSuggestionClick(suggestion, "shipping")}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
