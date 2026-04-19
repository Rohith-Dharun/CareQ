import { createAppointment } from "@/lib/actions/appointments";

export async function createAppointmentFromAI(userId: string, data: { doctorId: string, date: string, time: string, reason: string }) {
    try {
        const appointment = await createAppointment({
            userId,
            doctorId: data.doctorId,
            date: new Date(data.date),
            time: data.time,
            reason: data.reason
        });
        return { success: true, appointment };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
