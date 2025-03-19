import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { BusinessProfileSection } from "@/components/settings/BusinessProfileSection";
import { NotificationSection } from "@/components/settings/NotificationSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { useForm } from "react-hook-form";
import { SettingsFormValues, defaultValues } from "@/components/settings/settingsTypes";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PharmacySettings() {
  const form = useForm<SettingsFormValues>({
    defaultValues,
  });
  const { toast } = useToast();

  const onSubmit = (data: SettingsFormValues) => {
    // console.log('Settings form submitted:', data);
    // Handle form submission here
  };

  useEffect(() => {


    const fetchUser = async () => {

      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          console.error(
            "Authentication Error: No active session found during update"
          );
          throw new Error("No active session found");
        }

        const userID = session?.session?.user?.id

        const { data, error } = await supabase
          .from("profiles")
          .select()
          .eq("id", userID)
          .maybeSingle();

        if (error) {
          console.error("🚨 Supabase Fetch Error:", error);
          return;
        }

        if (!data) {
          console.warn("⚠️ No user found for this email.");
          return;
        }

        console.log("✅ User Data:", data);


        form.setValue("description", data.notes || "")
        form.setValue("business_name", data.company_name || "")
      } catch (error) {

      }
    };


    fetchUser()
    console.log(form.getValues())
  }, [])

  
  return (
    <DashboardLayout role="pharmacy">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your pharmacy settings and preferences
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <BusinessProfileSection form={form} />
              <NotificationSection form={form} />
              <SecuritySection form={form} />
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}