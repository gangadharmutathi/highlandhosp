import { prisma } from "./prisma-seed";
import { testimonials } from "./dummydata2";

async function main() {
  console.log("🚀 Starting Testimonial seeding...");

  // 1. Fetch the actual IDs for Doctor and Patient to ensure they exist
  const drAlice = await prisma.user.findUnique({
    where: { email: "alice.williams@clinic.com" },
  });

  const patientJohn = await prisma.user.findUnique({
    where: { email: "john.doe@example.com" },
  });

  if (!drAlice || !patientJohn) {
    throw new Error(
      "Could not find Dr. Alice or John Doe. Please ensure users are seeded.",
    );
  }

  console.log("Found Users, starting testimonial insertion...");

  // 2. Insert testimonials
  for (const item of testimonials) {
    // We use upsert here so you can run the script multiple times
    // without creating duplicate reviews for the same appointment.
    await prisma.doctorTestimonial.upsert({
      where: {
        appointmentId: item.appointmentId,
      },
      update: {}, // Don't change anything if it already exists
      create: {
        appointmentId: item.appointmentId,
        doctorId: drAlice.id,
        patientId: patientJohn.id,
        testimonialText: item.testimonialText,
        rating: item.rating,
      },
    });
  }

  console.log("✅ Successfully seeded 10 testimonials!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
