"use client";

import { useState, useTransition } from "react";
import type { AppointmentType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, TrashIcon, RotateCcwIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    createAppointmentType,
    updateAppointmentType,
    deleteAppointmentType,
    reactivateAppointmentType,
} from "@/lib/actions/appointment-types";

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90];

interface AppointmentTypeManagerProps {
    initialTypes: AppointmentType[];
}

interface FormState {
    name: string;
    description: string;
    duration: number;
    price: string;
}

const emptyForm: FormState = { name: "", description: "", duration: 30, price: "" };

export default function AppointmentTypeManager({ initialTypes }: AppointmentTypeManagerProps) {
    const [types, setTypes] = useState<AppointmentType[]>(initialTypes);
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const router = useRouter();

    const refresh = () => router.refresh();

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEdit = (type: AppointmentType) => {
        setEditingId(type.id);
        setForm({
            name: type.name,
            description: type.description ?? "",
            duration: type.duration,
            price: type.price.toString(),
        });
        setOpen(true);
    };

    const handleSave = () => {
        const price = parseFloat(form.price);
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        if (isNaN(price) || price < 0) { toast.error("Enter a valid price"); return; }

        startTransition(async () => {
            try {
                if (editingId) {
                    const updated = await updateAppointmentType(editingId, {
                        name: form.name,
                        description: form.description || undefined,
                        duration: form.duration,
                        price,
                    });
                    setTypes((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
                    toast.success("Appointment type updated");
                } else {
                    const created = await createAppointmentType({
                        name: form.name,
                        description: form.description || undefined,
                        duration: form.duration,
                        price,
                    });
                    setTypes((prev) => [created, ...prev]);
                    toast.success("Appointment type created");
                }
                setOpen(false);
                refresh();
            } catch (err: any) {
                toast.error(err.message ?? "Something went wrong");
            }
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteAppointmentType(id);
                setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: false } : t)));
                toast.success("Appointment type deactivated");
                refresh();
            } catch (err: any) {
                toast.error(err.message ?? "Failed to deactivate");
            }
        });
    };

    const handleReactivate = (id: string) => {
        startTransition(async () => {
            try {
                const updated = await reactivateAppointmentType(id);
                setTypes((prev) => prev.map((t) => (t.id === id ? updated : t)));
                toast.success("Appointment type reactivated");
                refresh();
            } catch (err: any) {
                toast.error(err.message ?? "Failed to reactivate");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? "Edit Appointment Type" : "New Appointment Type"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <Label htmlFor="apt-name">Name *</Label>
                                <Input
                                    id="apt-name"
                                    placeholder="e.g. New Patient Consultation"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="apt-desc">Description</Label>
                                <Input
                                    id="apt-desc"
                                    placeholder="Optional short description"
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Duration *</Label>
                                <Select
                                    value={form.duration.toString()}
                                    onValueChange={(v) => setForm((f) => ({ ...f, duration: Number(v) }))}
                                >
                                    <SelectTrigger id="apt-duration">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DURATION_OPTIONS.map((d) => (
                                            <SelectItem key={d} value={d.toString()}>
                                                {d} minutes
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="apt-price">Price (₹) *</Label>
                                <Input
                                    id="apt-price"
                                    type="number"
                                    min={0}
                                    step={50}
                                    placeholder="e.g. 800"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button className="flex-1" onClick={handleSave} disabled={isPending}>
                                    <CheckIcon className="w-4 h-4 mr-2" />
                                    {isPending ? "Saving…" : "Save"}
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={isPending}>
                                    <XIcon className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {types.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No appointment types yet. Click <strong>Add Type</strong> to create one.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {types.map((type) => (
                        <Card key={type.id} className={`transition-all ${!type.isActive ? "opacity-60" : ""}`}>
                            <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base truncate">{type.name}</CardTitle>
                                    {type.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{type.description}</p>
                                    )}
                                </div>
                                <Badge variant={type.isActive ? "default" : "secondary"} className="shrink-0">
                                    {type.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-medium">{type.duration} min</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Price</span>
                                    <span className="font-semibold text-primary">₹{type.price.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(type)} disabled={isPending}>
                                        <PencilIcon className="w-3 h-3 mr-1" />
                                        Edit
                                    </Button>
                                    {type.isActive ? (
                                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(type.id)} disabled={isPending}>
                                            <TrashIcon className="w-3 h-3 mr-1" />
                                            Deactivate
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleReactivate(type.id)} disabled={isPending}>
                                            <RotateCcwIcon className="w-3 h-3 mr-1" />
                                            Reactivate
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
