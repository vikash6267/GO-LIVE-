import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AddressFields } from "../users/forms/AddressFields";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";

const pharmacySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  license: z.string().min(5, "License number is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.object({
    attention: z.string().optional(),
    countryRegion: z.string().optional(),
    street1: z.string().min(2, "Street address is required"),
    street2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip_code: z.string().min(5, "ZIP code is required"),
    phone: z.string().optional(),
    faxNumber: z.string().optional(),
  }),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

interface AddPharmacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPharmacyAdded: () => void;
}

export function AddPharmacyModal({
  open,
  onOpenChange,
  onPharmacyAdded,
}: AddPharmacyModalProps) {
  const { toast } = useToast();
  const form = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      name: "",
      license: "",
      email: "",
      phone: "",
      address: {
        attention: "",
        countryRegion: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        zip_code: "",
        phone: "",
        faxNumber: "",
      },
    },
  });

  const onSubmit = (values: PharmacyFormData) => {
    // console.log("Adding new pharmacy:", values);
    toast({
      title: "Pharmacy Added",
      description: `${values.name} has been added to your group successfully`,
    });
    form.reset();
    onPharmacyAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Pharmacy</DialogTitle>
          <DialogDescription>
            Add a new pharmacy to your group. Fill in the pharmacy details
            below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter pharmacy name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter license number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <AddressFields form={form} type="address" />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4">
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Add Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
