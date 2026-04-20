import { PrismaClient, Gender } from "@prisma/client";

const prisma = new PrismaClient();

const doctors = [
    {
        name: "Dr. Rajesh Sharma",
        email: "rajesh.sharma@careq.in",
        phone: "+91-9876543210",
        specialization: "Cardiology",
        experience: 15,
        bio: "Senior cardiologist with 15+ years of experience in interventional cardiology and heart failure management.",
        imageUrl: "/doctors/rajesh-sharma.jpg",
        gender: Gender.MALE,
        availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"],
    },
    {
        name: "Dr. Priya Nair",
        email: "priya.nair@careq.in",
        phone: "+91-9876543211",
        specialization: "Dermatology",
        experience: 10,
        bio: "Experienced dermatologist specializing in cosmetic dermatology, acne treatment, and skin allergy management.",
        imageUrl: "/doctors/priya-nair.jpg",
        gender: Gender.FEMALE,
        availableSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00"],
    },
    {
        name: "Dr. Arun Mehta",
        email: "arun.mehta@careq.in",
        phone: "+91-9876543212",
        specialization: "Neurology",
        experience: 18,
        bio: "Renowned neurologist with expertise in stroke management, epilepsy, and neurodegenerative disorders.",
        imageUrl: "/doctors/arun-mehta.jpg",
        gender: Gender.MALE,
        availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "14:30", "15:00"],
    },
    {
        name: "Dr. Kavitha Iyer",
        email: "kavitha.iyer@careq.in",
        phone: "+91-9876543213",
        specialization: "Orthopedics",
        experience: 12,
        bio: "Orthopedic surgeon specializing in joint replacement, sports injuries, and spinal disorders.",
        imageUrl: "/doctors/kavitha-iyer.jpg",
        gender: Gender.FEMALE,
        availableSlots: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"],
    },
    {
        name: "Dr. Suresh Reddy",
        email: "suresh.reddy@careq.in",
        phone: "+91-9876543214",
        specialization: "Pediatrics",
        experience: 14,
        bio: "Pediatrician with extensive experience in neonatal care, childhood vaccinations, and developmental disorders.",
        imageUrl: "/doctors/suresh-reddy.jpg",
        gender: Gender.MALE,
        availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "15:00", "15:30", "16:00", "16:30"],
    },
    {
        name: "Dr. Ananya Deshmukh",
        email: "ananya.deshmukh@careq.in",
        phone: "+91-9876543215",
        specialization: "General Medicine",
        experience: 8,
        bio: "General physician skilled in managing chronic diseases, preventive healthcare, and acute medical conditions.",
        imageUrl: "/doctors/ananya-deshmukh.jpg",
        gender: Gender.FEMALE,
        availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00"],
    },
    {
        name: "Dr. Vikram Joshi",
        email: "vikram.joshi@careq.in",
        phone: "+91-9876543216",
        specialization: "ENT",
        experience: 11,
        bio: "ENT specialist with expertise in sinus surgery, hearing disorders, and pediatric ENT conditions.",
        imageUrl: "/doctors/vikram-joshi.jpg",
        gender: Gender.MALE,
        availableSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00"],
    },
    {
        name: "Dr. Meera Krishnan",
        email: "meera.krishnan@careq.in",
        phone: "+91-9876543217",
        specialization: "Ophthalmology",
        experience: 16,
        bio: "Senior ophthalmologist specializing in cataract surgery, LASIK, and retinal disease management.",
        imageUrl: "/doctors/meera-krishnan.jpg",
        gender: Gender.FEMALE,
        availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    },
    {
        name: "Dr. Sanjay Gupta",
        email: "sanjay.gupta@careq.in",
        phone: "+91-9876543218",
        specialization: "Psychiatry",
        experience: 13,
        bio: "Psychiatrist experienced in cognitive behavioral therapy, anxiety disorders, and de-addiction counseling.",
        imageUrl: "/doctors/sanjay-gupta.jpg",
        gender: Gender.MALE,
        availableSlots: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    },
    {
        name: "Dr. Deepa Venkatesh",
        email: "deepa.venkatesh@careq.in",
        phone: "+91-9876543219",
        specialization: "Gynecology",
        experience: 20,
        bio: "Senior gynecologist with two decades of experience in high-risk pregnancies, laparoscopic surgery, and fertility treatments.",
        imageUrl: "/doctors/deepa-venkatesh.jpg",
        gender: Gender.FEMALE,
        availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"],
    },
    {
        name: "Dr. Arjun Patel",
        email: "arjun.patel@careq.in",
        phone: "+91-9876543220",
        specialization: "Cardiology",
        experience: 9,
        bio: "Cardiologist specializing in echocardiography, preventive cardiology, and cardiac rehabilitation programs.",
        imageUrl: "/doctors/arjun-patel.jpg",
        gender: Gender.MALE,
        availableSlots: ["11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"],
    },
    {
        name: "Dr. Lakshmi Sundaram",
        email: "lakshmi.sundaram@careq.in",
        phone: "+91-9876543221",
        specialization: "Pediatrics",
        experience: 7,
        bio: "Pediatrician focused on childhood nutrition, behavioral pediatrics, and adolescent health management.",
        imageUrl: "/doctors/lakshmi-sundaram.jpg",
        gender: Gender.FEMALE,
        availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"],
    },
];

async function main() {
    console.log("🌱 Starting database seed...\n");

    for (const doctor of doctors) {
        const result = await prisma.doctor.upsert({
            where: { email: doctor.email },
            update: {},  // No update if already exists
            create: doctor,
        });
        console.log(`  ✅ ${result.name} (${result.specialization})`);
    }

    console.log(`\n🎉 Seeded ${doctors.length} doctors successfully!`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
