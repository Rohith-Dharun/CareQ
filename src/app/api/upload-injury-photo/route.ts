import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Injury Photo Upload API
 * Accepts multipart form data with an image file.
 * Stores the image as a base64 data URL in the database.
 * In production, replace with Cloudinary/S3 upload.
 */
export async function POST(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("image") as File;
        const userDescription = formData.get("description") as string | null;
        const appointmentId = formData.get("appointmentId") as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
        }

        // Get user from DB
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Convert file to base64 data URL (fallback when no cloud storage is configured)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const imageUrl = `data:${file.type};base64,${base64}`;

        // Create injury report in database
        const injuryReport = await prisma.injuryReport.create({
            data: {
                userId: user.id,
                imageUrl,
                userDescription: userDescription || undefined,
                appointmentId: appointmentId || undefined,
            },
        });

        return NextResponse.json({
            success: true,
            reportId: injuryReport.id,
            message: "Injury photo uploaded successfully",
        }, { status: 201 });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error.message || "Upload failed" },
            { status: 500 }
        );
    }
}
