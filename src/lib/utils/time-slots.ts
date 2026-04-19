/**
 * Dynamic time slot generation for CareQ appointment booking.
 */

export interface TimeSlot {
    time: string;
    endTime: string;
    displayLabel: string;
    available: boolean;
}

export interface BookedAppointment {
    time: string;
    duration: number;
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;
const BUFFER_MINUTES = 5;

function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTimeDisplay(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

function isSlotAvailable(
    startMin: number,
    durationMin: number,
    booked: BookedAppointment[],
    bufferMin: number = BUFFER_MINUTES
): boolean {
    const endMin = startMin + durationMin;
    for (const appt of booked) {
        const bookedStart = timeToMinutes(appt.time);
        const bookedEnd = bookedStart + appt.duration + bufferMin;
        const slotEnd = endMin + bufferMin;
        if (startMin < bookedEnd && bookedStart < slotEnd) return false;
    }
    return true;
}

export function generateDynamicTimeSlots(
    durationMinutes: number,
    bookedAppointments: BookedAppointment[]
): TimeSlot[] {
    if (!durationMinutes || durationMinutes <= 0) return [];

    const slots: TimeSlot[] = [];
    const startBound = WORK_START_HOUR * 60;
    const endBound = WORK_END_HOUR * 60;

    let cursor = startBound;
    while (cursor + durationMinutes <= endBound) {
        const startStr = minutesToTime(cursor);
        const endStr = minutesToTime(cursor + durationMinutes);
        const available = isSlotAvailable(cursor, durationMinutes, bookedAppointments);

        slots.push({
            time: startStr,
            endTime: endStr,
            displayLabel: `${formatTimeDisplay(startStr)} – ${formatTimeDisplay(endStr)}`,
            available,
        });

        cursor += durationMinutes;
    }

    return slots;
}
