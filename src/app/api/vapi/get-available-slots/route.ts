import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDynamicTimeSlots } from "@/lib/utils/time-slots";

/**
 * VAPI Function Tool: get-available-slots
 * Body: { doctorId: string, date: string, appointmentTypeId?: string }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { doctorId, date, appointmentTypeId } = body;

        if (!doctorId || !date) {
            return NextResponse.json({ error: "doctorId and date are required." }, { status: 400 });
        }

        const doctor = await prisma.doctor.findFirst({
            where: { id: doctorId, isActive: true },
            select: { name: true },
        });
        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found or not available." }, { status: 404 });
        }

        let durationMinutes = 30;
        if (appointmentTypeId) {
            const apptType = await prisma.appointmentType.findUnique({
                where: { id: appointmentTypeId },
                select: { duration: true },
            });
            if (apptType) durationMinutes = apptType.duration;
        }

        const booked = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: new Date(date),
                status: { in: ["BOOKED", "CONFIRMED", "COMPLETED"] },
            },
            select: { time: true, duration: true },
        });

        const slots = generateDynamicTimeSlots(durationMinutes, booked);
        const availableSlots = slots.filter((s) => s.available);

        return NextResponse.json({
            doctorName: doctor.name,
            date,
            durationMinutes,
            slots: availableSlots.map((s) => ({ time: s.time, label: s.displayLabel })),
            totalAvailable: availableSlots.length,
        }, { status: 200 });
    } catch (error) {
        console.error("[VAPI] get-available-slots error:", error);
        return NextResponse.json({ error: "Failed to fetch available slots." }, { status: 500 });
    }
}
