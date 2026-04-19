import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Check both role metadata AND env-based admin IDs
    const role = user.publicMetadata?.role as string;
    const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (role !== "admin" && !adminIds.includes(user.id)) {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
