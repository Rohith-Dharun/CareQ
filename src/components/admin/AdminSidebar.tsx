"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Settings,
    LogOut,
    HeartPulse
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Doctors", icon: Users, href: "/admin/doctors" },
    { name: "Appointments", icon: CalendarCheck, href: "/admin/appointments" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-2">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                    <HeartPulse className="size-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl tracking-tight">CareQ <span className="text-primary text-sm uppercase">Admin</span></span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                            pathname === item.href
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="size-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <LogOut className="size-4" />
                    Exit Admin
                </Link>
            </div>
        </aside>
    );
}
