"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDoctors() {
    const doctors = await prisma.doctor.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { appointments: true } } },
    });
    return doctors.map((d) => ({
        ...d,
        appointmentCount: d._count.appointments,
    }));
}

export async function createDoctor(data: {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience: number;
    bio?: string;
    imageUrl: string;
    gender: "MALE" | "FEMALE";
    availableSlots: string[];
}) {
    const doctor = await prisma.doctor.create({
        data,
    });
    revalidatePath("/admin/doctors");
    revalidatePath("/appointments");
    return doctor;
}

export async function updateDoctor(id: string, data: any) {
    const doctor = await prisma.doctor.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/doctors");
    revalidatePath("/appointments");
    return doctor;
}

export async function deleteDoctor(id: string) {
    await prisma.doctor.delete({
        where: { id },
    });
    revalidatePath("/admin/doctors");
    return { success: true };
}

export async function toggleDoctorStatus(id: string, isActive: boolean) {
    await prisma.doctor.update({
        where: { id },
        data: { isActive },
    });
    revalidatePath("/admin/doctors");
    return { success: true };
}

export async function getAvailableDoctors() {
    const doctors = await prisma.doctor.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: { _count: { select: { appointments: true } } },
    });
    return doctors.map((d) => ({
        ...d,
        appointmentCount: d._count.appointments,
    }));
}