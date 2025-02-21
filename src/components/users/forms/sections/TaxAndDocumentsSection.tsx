import { UseFormReturn } from "react-hook-form";
import { BaseUserFormData } from "../../schemas/sharedFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient";

interface TaxAndDocumentsSectionProps {
  form: UseFormReturn<BaseUserFormData>;
}

export function TaxAndDocumentsSection({ form }: TaxAndDocumentsSectionProps) {
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`user-documents/${fileName}`, file);

      if (error) throw error;

      if (data) {
        const documents = form.getValues('documents') || [];
        form.setValue('documents', [...documents, data.path]);
        
        toast({
          title: "Document Uploaded",
          description: "The document has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax & Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter Tax ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Documents</FormLabel>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              className="hidden"
              id="document-upload"
              onChange={handleFileUpload}
            />
            <Button asChild variant="outline">
              <label htmlFor="document-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </label>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}