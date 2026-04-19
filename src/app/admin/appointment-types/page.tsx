import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAllAppointmentTypes } from "@/lib/actions/appointment-types";
import AppointmentTypeManager from "@/components/admin/AppointmentTypeManager";
import NavBar from "@/components/NavBar";

export const metadata = {
    title: "Appointment Types — Admin | CareQ",
    description: "Manage appointment types and pricing",
};

async function AppointmentTypesPage() {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const user = await currentUser();
    const role = user?.publicMetadata?.role as string | undefined;
    const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (role !== "admin" && !adminIds.includes(userId)) {
        redirect("/dashboard");
    }

    const appointmentTypes = await getAllAppointmentTypes();

    return (
        <div className="min-h-screen bg-background">
            <NavBar />
            <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Appointment Types</h1>
                    <p className="text-muted-foreground">
                        Manage appointment types, durations, and pricing shown to patients.
                    </p>
                </div>
                <AppointmentTypeManager initialTypes={appointmentTypes} />
            </div>
        </div>
    );
}

export default AppointmentTypesPage;
