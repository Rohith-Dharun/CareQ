import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * VAPI Function Tool: get-available-doctors
 * Returns all active doctors for the AI assistant to present to users.
 * Optionally filter by specialization from request body.
 */
export async function POST(request: Request) {
    try {
        let specialization: string | undefined;
        try {
            const body = await request.json();
            specialization = body?.specialization || body?.speciality;
        } catch {
            // No body or invalid JSON — return all doctors
        }

        const doctors = await prisma.doctor.findMany({
            where: {
                isActive: true,
                ...(specialization && {
                    specialization: {
                        contains: specialization,
                        mode: "insensitive" as const,
                    },
                }),
            },
            select: {
                id: true,
                name: true,
                specialization: true,
                gender: true,
                bio: true,
                experience: true,
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ doctors }, { status: 200 });
    } catch (error) {
        console.error("[VAPI] get-available-doctors error:", error);
        return NextResponse.json({ error: "Failed to fetch doctors." }, { status: 500 });
    }
}
