import { prisma } from "./prisma-seed";
import { doctorProfiles, appointments, testimonials } from "./dummydata2";
import { AppointmentStatus, PatientType } from "./generated/client";

async function main() {
  console.log("Starting relational data seeding...");

  // 1. Get the actual IDs from the database by email
  const dbUsers = await prisma.user.findMany();
  const userMap = new Map(dbUsers.map((u) => [u.email, u.id]));

  const getUserId = (email: string) => {
    const id = userMap.get(email);
    if (!id)
      throw new Error(`User with email ${email} not found. Seed users first.`);
    return id;
  };

  // 2. Seed Doctor Profiles
  console.log("Seeding Doctor Profiles...");
  for (const profile of doctorProfiles) {
    // Find the user email associated with the placeholder ID in your dummy file
    // Note: In dummydata2, doctor1Id is used. We'll map the emails directly.
    const emailMap: Record<string, string> = {
      "14def99c-0205-4e6e-a770-a716e04d3fa3": "alice.williams@clinic.com",
      "ce542762-d8e0-411c-bac4-c9746716d330": "bob.brown@clinic.com",
      "6a92639b-8ae1-401a-8624-3314937925d3": "carol.davis@clinic.com",
    };

    const userEmail = emailMap[profile.userId];
    const realId = getUserId(userEmail);

    await prisma.doctorProfile.upsert({
      where: { userId: realId },
      update: {},
      create: {
        userId: realId,
        specialty: profile.specialty,
        brief: profile.brief,
        credentials: profile.credentials,
        languages: profile.languages,
        specializations: profile.specializations,
        isActive: profile.isActive,
      },
    });
  }

  // 3. Seed Appointments (Linking Doctor 1 and Patient 1)
  console.log("Seeding Appointments...");
  const drAliceId = getUserId("alice.williams@clinic.com");
  const patientJohnId = getUserId("john.doe@example.com");

  // We will loop through the appointments in your dummy data
  for (const apt of appointments) {
    await prisma.appointment.create({
      data: {
        doctorId: drAliceId,
        userId: patientJohnId,
        patientType: apt.patientType as PatientType,
        patientName: apt.patientName,
        appointmentStartUTC: apt.appointmentStartUTC,
        appointmentEndUTC: apt.appointmentEndUTC,
        phoneNumber: apt.phoneNumber,
        reasonForVisit: apt.reasonForVisit,
        // Override status to COMPLETED as requested
        status: AppointmentStatus.COMPLETED,
        paidAt: apt.paidAt,
        paymentMethod: apt.paymentMethod,
        patientDateOfbBirth: apt.patientdateofbirth,
      },
    });
  }

  console.log(
    "✅ Relational seeding completed: Profiles and 10 Appointments created.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
