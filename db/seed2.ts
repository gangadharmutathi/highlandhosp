import { prisma } from "./prisma";
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
      "c3250068-f57d-42dc-b189-a76ec713c2b1": "alice.williams@clinic.com",
      "8c1c074b-8bdb-4f72-94ff-442aef88be0e": "bob.brown@clinic.com",
      "678241b9-99cf-4312-b9f3-28e14c60e9e7": "carol.davis@clinic.com",
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
