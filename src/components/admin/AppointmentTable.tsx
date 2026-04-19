"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    updateAppointmentStatus
} from "@/lib/actions/appointments";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";

interface AppointmentTableProps {
    appointments: any[];
}

const statusColors: Record<AppointmentStatus, string> = {
    BOOKED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    CONFIRMED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AppointmentTable({ appointments }: AppointmentTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleStatusChange = async (id: string, status: AppointmentStatus) => {
        setLoadingId(id);
        try {
            await updateAppointmentStatus(id, status);
            toast.success(`Appointment marked as ${status.toLowerCase()}`);
        } catch (error) {
            toast.error("Failed to update appointment");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {appointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-semibold text-foreground">
                                    {apt.user.firstName} {apt.user.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">{apt.user.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{apt.doctor.name}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col text-sm">
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <Calendar className="size-3 text-muted-foreground" />
                                        {format(new Date(apt.date), "PPP")}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="size-3" />
                                        {apt.time}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant="outline" className={statusColors[apt.status as AppointmentStatus]}>
                                    {apt.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-lg transition-colors">
                                        <MoreHorizontal className="size-4 text-muted-foreground" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-indigo-500 focus:text-indigo-500"
                                            onClick={() => handleStatusChange(apt.id, "CONFIRMED")}
                                        >
                                            <CheckCircle2 className="size-4" /> Confirm
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-green-500 focus:text-green-500"
                                            onClick={() => handleStatusChange(apt.id, "COMPLETED")}
                                        >
                                            <CheckCircle2 className="size-4" /> Complete
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                            onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                                        >
                                            <XCircle className="size-4" /> Cancel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                No appointments found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
