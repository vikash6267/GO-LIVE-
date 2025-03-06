import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/selectors/userSelectors";

// Define the validation schema with Zod
const locationSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    type: z.string().min(1, { message: "Type is required" }),
    contact_email: z.string().email({ message: "Invalid email address" }),
    contact_phone: z.string().min(1, { message: "Phone number is required" }),
    address: z.object({
        city: z.string().min(1, { message: "City is required" }),
        state: z.string().min(1, { message: "State is required" }),
        street1: z.string().min(1, { message: "Street address is required" }),
        street2: z.string().optional(),
        zip_code: z.string().min(1, { message: "ZIP code is required" }),
        attention: z.string().optional(),
        faxNumber: z.string().optional(),

        phone: z.string().optional(),
    }),
});

interface Address {
    city: string;
    phone: string;
    state: string;
    street1: string;
    street2: string;
    zip_code: string;
    attention: string;
    faxNumber: string;
    countryRegion: string;
}

interface Location {
    id: string;
    name: string;
    type: string;
    contact_email: string;
    contact_phone: string;
    address: Address;
}

interface EditLocationPopupProps {
    location: Location;
    onClose: () => void;
    onSave: () => void;
}

type FormData = z.infer<typeof locationSchema>;

const EditLocationPopup: React.FC<EditLocationPopupProps> = ({ location, onClose, onSave }) => {
    const { toast } = useToast();
    const userProfile = useSelector(selectUserProfile);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            ...location,
            address: {
                ...location?.address
            }
        }
    });

    useEffect(() => {

    })

    console.log(location)

    const onSubmit = async (data: FormData) => {

        console.log("Submitted Data:", data);

        // ✅ Correctly defining `updateLocation`
        const updateLocation = {
            address: data.address,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            name: data.name,
            type: data.type
        };

        try {
            // ✅ Updating the location in Supabase
            const { data: updatedData, error } = await supabase
                .from("locations")
                .update(updateLocation)
                .eq("id", String(location.id))
                .select("*") // Returns the updated order



            if (error) {
                console.error("Error updating location:", error);
                alert("Failed to update location. Please try again.");
                return;
            }

            if (!updatedData) {
                alert("Location not found. Please check the ID.");
            return
            }

            console.log("Updated Location Data:", updatedData);
            toast({
                title: `location Update`,
                description: " location details updated...",
            });


            const { data: updatedData2, error : error2 } = await supabase
            .from("locations")
            .select("*") // Returns the updated order
            .eq("profile_id", userProfile?.id)

            if (error2) {
                console.error("Error updating location:", error);
                alert("Failed to update location. Please try again.");
                return;
            }

            if (updatedData2 && updatedData2.length > 0) {
                const newLocations = updatedData2.map((location) => ({
                  name: location.name || "",
                  type: location.type || "branch",
                  status: location.status || "pending",
                  address: location.address || {},
                  contact_email: location.contact_email || "",
                  contact_phone: location.contact_phone || "",
                }));
              
                console.log(newLocations);
              
                const { data: profileData2, error: error3 } = await supabase
                  .from("profiles")
                  .update({ locations: newLocations })
                  .eq("id", userProfile?.id);
              
                if (error3) {
                  console.error("Error updating locations:", error3);
                } else {
                  console.log("Locations updated successfully", profileData2);
                }
              }
              

            onClose()
            // onSave()
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ">
            <Card className="w-full max-w-2xl bg-white shadow-xl h-[90vh] overflow-y-scroll">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">Edit Location</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">General Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="name"
                                                {...field}
                                                className={errors.name ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="type"
                                        control={control}
                                        rules={{ required: "Type is required" }}
                                        render={({ field }) => (
                                            <select
                                                id="type"
                                                {...field}
                                                className={`w-full p-2 border rounded-md ${errors.type ? "border-red-500" : "border-gray-300"}`}
                                            >
                                                <option value="" disabled>Select Type</option>
                                                <option value="Branch">Branch</option>

                                            </select>
                                        )}
                                    />
                                    {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="contact_email"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                {...field}
                                                className={errors.contact_email ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                    {errors.contact_email && (
                                        <p className="text-red-500 text-sm">{errors.contact_email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="contact_phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="contact_phone"
                                                {...field}
                                                className={errors.contact_phone ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                    {errors.contact_phone && (
                                        <p className="text-red-500 text-sm">{errors.contact_phone.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="street1">
                                        Street Address 1 <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="address.street1"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="street1"
                                                {...field}
                                                className={errors.address?.street1 ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                    {errors.address?.street1 && (
                                        <p className="text-red-500 text-sm">{errors.address.street1.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="street2">
                                        Street Address 2
                                    </Label>
                                    <Controller
                                        name="address.street2"
                                        control={control}
                                        render={({ field }) => (
                                            <Input id="street2" {...field} />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="address.city"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="city"
                                                {...field}
                                                className={errors.address?.city ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                    {errors.address?.city && (
                                        <p className="text-red-500 text-sm">{errors.address.city.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">
                                        State <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="address.state"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="state"
                                                {...field}
                                                className={errors.address?.state ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                    {errors.address?.state && (
                                        <p className="text-red-500 text-sm">{errors.address.state.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zip_code">
                                        ZIP Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="address.zip_code"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="zip_code"
                                                {...field}
                                                className={errors.address?.zip_code ? "border-red-500" : ""}
                                            />
                                        )}
                                    />
                                    {errors.address?.zip_code && (
                                        <p className="text-red-500 text-sm">{errors.address.zip_code.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Address Phone
                                    </Label>
                                    <Controller
                                        name="address.phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input id="phone" {...field} />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="attention">
                                        Attention
                                    </Label>
                                    <Controller
                                        name="address.attention"
                                        control={control}
                                        render={({ field }) => (
                                            <Input id="attention" {...field} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="faxNumber">
                                        Fax Number
                                    </Label>
                                    <Controller
                                        name="address.faxNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Input id="faxNumber" {...field} />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-2 border-t p-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default EditLocationPopup;
