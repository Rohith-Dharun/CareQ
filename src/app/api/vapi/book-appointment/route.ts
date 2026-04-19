import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import getResend from "@/lib/resend";
import AppointmentConfirmationEmail from "@/components/EMAIL/AppointmentConfirmationEmail";
import { format } from "date-fns";

/**
 * VAPI Function Tool: book-appointment
 * Called by VAPI when a Pro user confirms a booking via voice.
 *
 * Body: { clerkUserId, doctorId, date, time, reason?, appointmentTypeId? }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clerkUserId, doctorId, date, time, reason, appointmentTypeId } = body;

        if (!clerkUserId || !doctorId || !date || !time) {
            return NextResponse.json(
                { error: "clerkUserId, doctorId, date, and time are required." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
        if (!user) {
            return NextResponse.json(
                { error: "User not found. Please ensure the account is set up." },
                { status: 404 }
            );
        }

        const doctor = await prisma.doctor.findFirst({
            where: { id: doctorId, isActive: true },
            select: { name: true },
        });
        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found or unavailable." }, { status: 404 });
        }

        let duration = 30;
        let appointmentTypeName: string | undefined;
        let appointmentTypePrice: number | undefined;

        if (appointmentTypeId) {
            const apptType = await prisma.appointmentType.findUnique({ where: { id: appointmentTypeId } });
            if (apptType) {
                duration = apptType.duration;
                appointmentTypeName = apptType.name;
                appointmentTypePrice = apptType.price;
            }
        }

        const appointment = await prisma.$transaction(async (tx) => {
            const conflict = await tx.appointment.findFirst({
                where: {
                    doctorId,
                    date: new Date(date),
                    time,
                    status: { in: ["BOOKED", "CONFIRMED", "COMPLETED"] },
                },
            });
            if (conflict) throw new Error("That time slot is no longer available. Please choose another.");

            return tx.appointment.create({
                data: {
                    userId: user.id,
                    doctorId,
                    date: new Date(date),
                    time,
                    duration,
                    reason: reason || appointmentTypeName || "General consultation",
                    status: "CONFIRMED",
                    bookedViaVoice: true,
                    ...(appointmentTypeId && { appointmentTypeId }),
                },
                include: {
                    doctor: { select: { name: true } },
                    user: { select: { firstName: true, lastName: true, email: true } },
                },
            });
        });

        const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");
        try {
            await getResend().emails.send({
                from: "CareQ <no-reply@resend.dev>",
                to: [user.email],
                subject: "Appointment Confirmation - CareQ",
                react: AppointmentConfirmationEmail({
                    doctorName: doctor.name,
                    appointmentDate: formattedDate,
                    appointmentTime: time,
                    appointmentType: appointmentTypeName,
                    duration,
                    price: appointmentTypePrice ? `₹${appointmentTypePrice.toLocaleString("en-IN")}` : undefined,
                }),
            });
        } catch (emailError) {
            console.error("[VAPI] Failed to send confirmation email:", emailError);
        }

        return NextResponse.json({
            success: true,
            appointmentId: appointment.id,
            message: `Appointment booked with ${doctor.name} on ${formattedDate} at ${time}. A confirmation email has been sent to ${user.email}.`,
        }, { status: 201 });
    } catch (error: any) {
        console.error("[VAPI] book-appointment error:", error);
        return NextResponse.json({ error: error.message || "Failed to book appointment." }, { status: 500 });
    }
}
