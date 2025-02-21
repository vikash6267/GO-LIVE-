export interface SettingsFormValues {
  // Business Profile
  businessName: string;
  description: string;
  address: string;
  suite: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  logo: string;  // Added this field

  // Security Settings
  currentPassword: string;
  newPassword: string;
  twoFactorEnabled: boolean;

  // Invoice Settings
  invoiceHeaderText: string;
  invoiceFooterText: string;
  showBusinessAddress: boolean;
  showPaymentInstructions: boolean;
  customPaymentInstructions: string;
  invoiceTermsAndConditions: string;
  showInvoiceDueDate: boolean;
  invoiceLogo: string;
  showLogo: boolean;
  invoiceAccentColor: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  invoiceDueDays: number;
  invoiceNotes: string;

  // Payment Settings
  authorizeNetEnabled: boolean;
  authorizeNetApiLoginId: string;
  authorizeNetTransactionKey: string;
  authorizeNetTestMode: boolean;

  // Notification Settings
  emailNotifications: boolean;
  orderUpdates: boolean;
}

export const defaultValues: SettingsFormValues = {
  businessName: "",
  description: "",
  address: "",
  suite: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  email: "",
  logo: "",  // Added this field
  currentPassword: "",
  newPassword: "",
  twoFactorEnabled: false,
  invoiceHeaderText: "",
  invoiceFooterText: "",
  showBusinessAddress: true,
  showPaymentInstructions: true,
  customPaymentInstructions: "",
  invoiceTermsAndConditions: "",
  showInvoiceDueDate: true,
  invoiceLogo: "",
  showLogo: true,
  invoiceAccentColor: "#000000",
  invoicePrefix: "INV",
  nextInvoiceNumber: 1000,
  invoiceDueDays: 30,
  invoiceNotes: "",
  authorizeNetEnabled: false,
  authorizeNetApiLoginId: "",
  authorizeNetTransactionKey: "",
  authorizeNetTestMode: false,
  emailNotifications: false,
  orderUpdates: false
};