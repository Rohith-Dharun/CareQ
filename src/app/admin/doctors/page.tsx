import { getDoctors } from "@/lib/actions/doctors";
import DoctorTable from "@/components/admin/DoctorTable";
import DoctorForm from "@/components/admin/DoctorForm";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDoctorsPage() {
    const doctors = await getDoctors();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Doctor Management</h1>
                    <p className="text-muted-foreground">Add, edit, and manage hospital doctors.</p>
                </div>
                <DoctorForm />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <DoctorTable doctors={doctors} />
            </div>
        </div>
    );
}
