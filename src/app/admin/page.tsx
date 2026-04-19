import {
    Users,
    CalendarCheck,
    CheckCircle2,
    Clock
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
    const doctorCount = await prisma.doctor.count();
    const appointmentCount = await prisma.appointment.count();
    const completedCount = await prisma.appointment.count({ where: { status: "COMPLETED" } });
    const pendingCount = await prisma.appointment.count({ where: { status: "BOOKED" } });

    const stats = [
        { name: "Total Doctors", value: doctorCount, icon: Users, color: "text-blue-500" },
        { name: "Total Appointments", value: appointmentCount, icon: CalendarCheck, color: "text-indigo-500" },
        { name: "Completed", value: completedCount, icon: CheckCircle2, color: "text-green-500" },
        { name: "Pending", value: pendingCount, icon: Clock, color: "text-orange-500" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here is a quick look at your hospital statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                            <stat.icon className={`size-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent activity or charts would go here */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>Recent Doctors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Detailed activity logs coming soon...</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">All systems operational</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}