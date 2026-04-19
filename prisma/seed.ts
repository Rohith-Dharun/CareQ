/**
 * Prisma seed script — populates initial appointment types.
 * Run with: npx prisma db seed
 *  OR: node prisma/seed.cjs  (after compiling with ts-node)
 *
 * package.json "prisma": { "seed": "ts-node --compiler-options={\"module\":\"CommonJS\"} prisma/seed.ts" }
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding appointment types...");

    const types = [
        {
            name: "New Patient Consultation",
            description: "First-time visit to discuss your health concerns with a doctor.",
            duration: 30,
            price: 800,
        },
        {
            name: "Follow-up Consultation",
            description: "Return visit to check on your progress or ongoing treatment.",
            duration: 20,
            price: 500,
        },
        {
            name: "Routine Check-up",
            description: "Standard annual or periodic health check.",
            duration: 30,
            price: 600,
        },
        {
            name: "Emergency Visit",
            description: "Urgent consultation for acute symptoms or injuries.",
            duration: 20,
            price: 1200,
        },
        {
            name: "Minor Procedure",
            description: "Small in-office procedure such as wound cleaning or suturing.",
            duration: 60,
            price: 2500,
        },
        {
            name: "Pre-Surgery Evaluation",
            description: "Pre-operative assessment and clearance.",
            duration: 45,
            price: 1500,
        },
        {
            name: "Post-Surgery Follow-up",
            description: "Post-operative check to monitor recovery.",
            duration: 30,
            price: 900,
        },
    ];

    for (const type of types) {
        await prisma.appointmentType.upsert({
            where: { name: type.name },
            update: {},
            create: type,
        });
        console.log(`  ✅ ${type.name}`);
    }

    console.log("✅ Seeding complete.");
}

main()
    .catch((e) => {
        console.error("Seed error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
