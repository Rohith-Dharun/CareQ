"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

export async function getAllAppointments() {
    return await prisma.appointment.findMany({
        include: {
            user: true,
            doctor: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    await prisma.appointment.update({
        where: { id },
        data: { status },
    });
    revalidatePath("/admin/appointments");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function createAppointment(data: {
    userId: string;
    doctorId: string;
    date: Date;
    time: string;
    reason?: string;
}) {
    const appointment = await prisma.appointment.create({
        data: {
            ...data,
            status: "BOOKED" as any,
        },
    });
    revalidatePath("/dashboard");
    revalidatePath("/admin/appointments");
    return appointment;
}

export async function bookAppointment(data: any) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error("User not found");

    const appointment = await prisma.appointment.create({
        data: {
            ...data,
            date: new Date(data.date),
            userId: user.id,
            status: "BOOKED" as any,
        },
        include: {
            doctor: { select: { name: true, gender: true } },
            user: { select: { email: true } },
        },
    });

    return {
        ...appointment,
        doctorName: appointment.doctor.name,
        doctorGender: appointment.doctor.gender,
        patientEmail: appointment.user.email,
    };
}

export async function cancelAppointment(id: string) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { user: true },
    });

    if (!appointment) throw new Error("Appointment not found");
    if (appointment.user.clerkId !== clerkId) throw new Error("Not authorized to cancel this appointment");

    // 24-hour cancellation policy
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":").map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    const hoursUntil = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntil < 24) {
        throw new Error("Cannot cancel within 24 hours of appointment. Please contact support.");
    }

    await prisma.appointment.update({
        where: { id },
        data: { status: "CANCELLED" as any },
    });
    revalidatePath("/dashboard");
    revalidatePath("/admin/appointments");
}

export async function getAppointments() {
    const appointments = await prisma.appointment.findMany({
        include: { user: true, doctor: true },
        orderBy: { createdAt: "desc" },
    });
    return appointments.map((a) => ({
        ...a,
        patientName: `${a.user.firstName || ""} ${a.user.lastName || ""}`.trim() || "Unknown",
        patientEmail: a.user.email,
        doctorName: a.doctor.name,
    }));
}

export async function getUserAppointments() {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkId } = await auth();
    if (!clerkId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return [];

    const appointments = await prisma.appointment.findMany({
        where: { userId: user.id },
        include: { doctor: true },
        orderBy: { date: "asc" },
    });
    return appointments.map((a) => ({
        ...a,
        date: a.date.toISOString(),
        doctorName: a.doctor.name,
    }));
}

export async function getBookedTimeSlots(doctorId: string, date: string) {
    const appointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            date: new Date(date),
            status: { notIn: ["CANCELLED" as any] }
        },
        select: { time: true, duration: true }
    });
    return appointments;
}

export async function getUserAppointmentStats() {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return { totalAppointments: 0, completedAppointments: 0 };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return { totalAppointments: 0, completedAppointments: 0 };
        }

        const stats = await prisma.appointment.groupBy({
            by: ['status'],
            where: { userId: user.id },
            _count: {
                id: true
            }
        });

        const totalAppointments = stats.reduce((acc, curr) => acc + curr._count.id, 0);
        const completedAppointments = stats.find(s => s.status === 'COMPLETED')?._count.id || 0;

        return { totalAppointments, completedAppointments };
    } catch (e) {
        console.error(e);
        return { totalAppointments: 0, completedAppointments: 0 };
    }
}
