import { getAllAppointments } from "@/lib/actions/appointments";
import AppointmentTable from "@/components/admin/AppointmentTable";

export default async function AdminAppointmentsPage() {
    const appointments = await getAllAppointments();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Appointment Management</h1>
                <p className="text-muted-foreground">Monitor and update all hospital appointments.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <AppointmentTable appointments={appointments} />
            </div>
        </div>
    );
}
