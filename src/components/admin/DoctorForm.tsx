"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createDoctor } from "@/lib/actions/doctors";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const doctorSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone is required"),
    specialization: z.string().min(2, "Specialization is required"),
    experience: z.coerce.number().min(0),
    bio: z.string().optional(),
    imageUrl: z.string().url("Invalid image URL"),
    gender: z.enum(["MALE", "FEMALE"]),
    availableSlots: z.string().transform((val) => val.split(",").map(s => s.trim())),
});

export default function DoctorForm() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(doctorSchema),
        defaultValues: {
            gender: "MALE",
        }
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await createDoctor(data);
            toast.success("Doctor added successfully");
            setOpen(false);
            reset();
        } catch (error) {
            toast.error("Failed to add doctor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl">
                    <Plus className="size-4" /> Add Doctor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input {...register("name")} placeholder="Dr. John Doe" />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input {...register("email")} type="email" placeholder="john@example.com" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input {...register("phone")} placeholder="+1 234 567 890" />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Specialization</Label>
                            <Input {...register("specialization")} placeholder="Cardiology" />
                            {errors.specialization && <p className="text-xs text-red-500">{errors.specialization.message as string}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Experience (Years)</Label>
                            <Input {...register("experience")} type="number" />
                            {errors.experience && <p className="text-xs text-red-500">{errors.experience.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select onValueChange={(val) => setValue("gender", val as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input {...register("imageUrl")} placeholder="https://example.com/image.jpg" />
                        {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Available Slots (comma-separated)</Label>
                        <Input {...register("availableSlots")} placeholder="09:00, 10:00, 11:00" />
                        <p className="text-[10px] text-muted-foreground italic">Add time slots separated by commas.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Biography</Label>
                        <Textarea {...register("bio")} placeholder="Doctor's background and expertise..." />
                    </div>

                    <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                        {loading ? "Adding..." : "Add Doctor"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
