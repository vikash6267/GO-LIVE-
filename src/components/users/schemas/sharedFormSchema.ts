import * as z from "zod";

export const addressSchema = z.object({
  attention: z.string().optional(),
  countryRegion: z.string().optional(),
  street1: z.string().min(2, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip_code: z.string().min(5, "ZIP code is required"),
  phone: z.string().optional(),
  faxNumber: z.string().optional(),
});

const locationSchema = z.object({
  name: z.string().min(2, "Location name is required"),
  type: z.enum(["headquarters", "branch", "warehouse", "retail"]),
  status: z.enum(["active", "inactive", "pending"]),
  address: addressSchema,
  manager: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export const baseUserSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  type: z.enum(["pharmacy", "hospital", "group"]),
  status: z.enum(["active", "inactive", "pending"]),
  role: z.enum(["admin", "manager", "staff", "user"]),
  companyName: z.string().min(2, "Company name is required"),
  displayName: z.string().optional(),
  workPhone: z.string().min(10, "Work phone must be at least 10 digits"),
  mobilePhone: z.string().min(10, "Mobile phone must be at least 10 digits"),
  pharmacyLicense: z.string().optional(),
  groupStation: z.string().optional(),
  taxId: z.string().optional(),
  documents: z.array(z.string()).optional().default([]),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  sameAsShipping: z.boolean().default(false),
  taxPreference: z.string().default("Taxable"),
  currency: z.string().default("USD"),
  paymentTerms: z.string().default("DueOnReceipt"),
  enablePortal: z.boolean().default(false),
  portalLanguage: z.string().default("English"),
  alternativeEmail: z.string().email("Invalid email").optional(),
  website: z.string().url("Invalid URL").optional(),
  faxNumber: z.string().optional(),
  contactPerson: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  languagePreference: z.string().optional(),
  creditLimit: z.string().optional(),
  paymentMethod: z.string().optional(),
  groupType: z.string().optional(),
  parentGroup: z.string().optional(),
  locations: z.array(locationSchema).default([]),
});

export type BaseUserFormData = z.infer<typeof baseUserSchema>;
export type LocationData = z.infer<typeof locationSchema>;
export type AddressData = z.infer<typeof addressSchema>;
