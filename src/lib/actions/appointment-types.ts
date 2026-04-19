"use server";

import { prisma } from "../prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ── Admin guard ────────────────────────────────────────────────────
async function requireAdmin() {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in.");

    const user = await currentUser();
    const role = user?.publicMetadata?.role as string | undefined;
    const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (role !== "admin" && !adminIds.includes(userId)) {
        throw new Error("You do not have permission to perform this action.");
    }
    return userId;
}

// ── Types ──────────────────────────────────────────────────────────
export interface AppointmentTypeInput {
    name: string;
    description?: string;
    duration: number;
    price: number;
}

// ── Public queries ─────────────────────────────────────────────────

/** Returns only active appointment types (used in booking flow). */
export async function getAppointmentTypes() {
    try {
        return await prisma.appointmentType.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error fetching appointment types:", error);
        throw new Error("Failed to fetch appointment types.");
    }
}

// ── Admin queries ──────────────────────────────────────────────────

/** Returns ALL appointment types including inactive (admin only). */
export async function getAllAppointmentTypes() {
    await requireAdmin();
    try {
        return await prisma.appointmentType.findMany({
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching all appointment types:", error);
        throw new Error("Failed to fetch appointment types.");
    }
}

// ── Admin mutations ────────────────────────────────────────────────

export async function createAppointmentType(input: AppointmentTypeInput) {
    await requireAdmin();
    try {
        if (!input.name) throw new Error("Name is required.");
        if (!input.duration || input.duration <= 0) throw new Error("Duration must be positive.");
        if (input.price == null || input.price < 0) throw new Error("Price must be 0 or more.");

        const type = await prisma.appointmentType.create({
            data: {
                name: input.name.trim(),
                description: input.description?.trim(),
                duration: input.duration,
                price: input.price,
            },
        });
        revalidatePath("/admin/appointment-types");
        revalidatePath("/appointments");
        return type;
    } catch (error: any) {
        console.error("Error creating appointment type:", error);
        if (error?.code === "P2002") throw new Error("An appointment type with this name already exists.");
        throw new Error(error.message || "Failed to create appointment type.");
    }
}

export async function updateAppointmentType(
    id: string,
    input: Partial<AppointmentTypeInput> & { isActive?: boolean }
) {
    await requireAdmin();
    try {
        if (!id) throw new Error("ID is required.");

        const type = await prisma.appointmentType.update({
            where: { id },
            data: {
                ...(input.name !== undefined && { name: input.name.trim() }),
                ...(input.description !== undefined && { description: input.description?.trim() }),
                ...(input.duration !== undefined && { duration: input.duration }),
                ...(input.price !== undefined && { price: input.price }),
                ...(input.isActive !== undefined && { isActive: input.isActive }),
            },
        });
        revalidatePath("/admin/appointment-types");
        revalidatePath("/appointments");
        return type;
    } catch (error: any) {
        console.error("Error updating appointment type:", error);
        if (error?.code === "P2002") throw new Error("An appointment type with this name already exists.");
        throw new Error(error.message || "Failed to update appointment type.");
    }
}

/** Soft-deletes by setting isActive = false. */
export async function deleteAppointmentType(id: string) {
    await requireAdmin();
    try {
        await prisma.appointmentType.update({
            where: { id },
            data: { isActive: false },
        });
        revalidatePath("/admin/appointment-types");
        revalidatePath("/appointments");
        return { success: true };
    } catch (error) {
        console.error("Error deleting appointment type:", error);
        throw new Error("Failed to delete appointment type.");
    }
}

/** Reactivates a previously soft-deleted type. */
export async function reactivateAppointmentType(id: string) {
    await requireAdmin();
    try {
        const type = await prisma.appointmentType.update({
            where: { id },
            data: { isActive: true },
        });
        revalidatePath("/admin/appointment-types");
        revalidatePath("/appointments");
        return type;
    } catch (error) {
        console.error("Error reactivating appointment type:", error);
        throw new Error("Failed to reactivate appointment type.");
    }
}
