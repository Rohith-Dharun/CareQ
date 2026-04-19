"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    UserCheck,
    UserMinus,
    CheckCircle2,
    XCircle
} from "lucide-react";
import {
    toggleDoctorStatus,
    deleteDoctor
} from "@/lib/actions/doctors";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface DoctorTableProps {
    doctors: any[];
}

export default function DoctorTable({ doctors }: DoctorTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setLoadingId(id);
        try {
            await toggleDoctorStatus(id, !currentStatus);
            toast.success("Doctor availability updated");
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this doctor?")) return;
        try {
            await deleteDoctor(id);
            toast.success("Doctor deleted successfully");
        } catch (error) {
            toast.error("Failed to delete doctor");
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specialization</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Availability</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {doctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {doctor.imageUrl ? (
                                            <img src={doctor.imageUrl} alt={doctor.name} className="size-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold">{doctor.name[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">{doctor.name}</div>
                                        <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{doctor.specialization}</td>
                            <td className="px-6 py-4 text-sm">{doctor.experience} Years</td>
                            <td className="px-6 py-4">
                                {doctor.isActive ? (
                                    <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                                        Inactive
                                    </Badge>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <Switch
                                    checked={doctor.isActive}
                                    onCheckedChange={() => handleToggle(doctor.id, doctor.isActive)}
                                    disabled={loadingId === doctor.id}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-lg transition-colors">
                                        <MoreHorizontal className="size-4 text-muted-foreground" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="gap-2 cursor-pointer">
                                            <Edit className="size-4" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(doctor.id)}
                                        >
                                            <Trash2 className="size-4" /> Delete Doctor
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                    {doctors.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                No doctors found. Add your first doctor to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
