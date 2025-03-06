"use client"

import { useState, useEffect, useCallback } from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { UseFormReturn } from "react-hook-form"

interface CustomerInfoFieldsProps {
  form: UseFormReturn<any>
  readOnly?: boolean
}

export function CustomerInfoFields({ form, readOnly = false }: CustomerInfoFieldsProps) {
  const [sameAsCustomer, setSameAsCustomer] = useState(false)
console.log(form.getValues())
  // Function to copy customer info to shipping address
  const syncShippingWithCustomer = useCallback(() => {
    const customerInfo = form.getValues("customerInfo")
    form.setValue("shippingAddress.fullName", customerInfo.name, { shouldValidate: true })
    form.setValue("shippingAddress.email", customerInfo.email, { shouldValidate: true })
    form.setValue("shippingAddress.phone", customerInfo.phone, { shouldValidate: true })
    form.setValue("shippingAddress.address.street", customerInfo.address.street, { shouldValidate: true })
    form.setValue("shippingAddress.address.city", customerInfo.address.city, { shouldValidate: true })
    form.setValue("shippingAddress.address.state", customerInfo.address.state, { shouldValidate: true })
    form.setValue("shippingAddress.address.zip_code", customerInfo.address.zip_code, { shouldValidate: true })
    
  }, [form])

  // Handle toggle change
  const handleToggle = (checked: boolean) => {
    setSameAsCustomer(checked)
    if (checked) {
      syncShippingWithCustomer()
    }
  }

  // Listen for changes in customer info when toggle is on
  useEffect(() => {
    if (sameAsCustomer) {
      const subscription = form.watch((value, { name }) => {
        if (name && name.startsWith("customerInfo.")) {
          syncShippingWithCustomer()
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [sameAsCustomer, form, syncShippingWithCustomer])

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "customerInfo.name", label: "Name" },
            { name: "customerInfo.email", label: "Email", type: "email" },
            { name: "customerInfo.phone", label: "Phone", type: "tel" },
            { name: "customerInfo.address.street", label: "Address" },
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
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 mb-2">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <div className="flex items-center space-x-2">
            <Switch id="same-as-customer" checked={sameAsCustomer} onCheckedChange={handleToggle} />
            <Label htmlFor="same-as-customer" className="cursor-pointer">
              Same as Customer Info
            </Label>
          </div>
        </div> 
        

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "shippingAddress.fullName", label: "Name" },
            { name: "shippingAddress.email", label: "Email", type: "email" },
            { name: "shippingAddress.phone", label: "Phone", type: "tel" },
            { name: "shippingAddress.address.street", label: "Address" },
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
                      className={readOnly || sameAsCustomer ? "bg-gray-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </>
  )
}

