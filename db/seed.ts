// db/seed.ts
import { prisma } from "./prisma";
import {
  users,
  departments,
  bannerImages,
  appSettings,
  workingDays,
} from "./dummydata2";

async function main() {
  console.log("Emptying existing data...");
  // Clear tables in reverse order of dependency to avoid foreign key errors
  await prisma.department.deleteMany();
  await prisma.bannerImage.deleteMany();
  await prisma.appSettings.deleteMany();
  await prisma.workingDay.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Users...");
  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        isRootAdmin: user.isRootAdmin,
        image: user.image,
        phoneNumber: user.phoneNumber,
        address: user.address,
        // Mapping 'dateofbirth' from dummy data to 'dateofBirth' in schema
        dateofBirth: user.dateofbirth,
      },
    });
  }

  console.log("Seeding Departments...");
  await prisma.department.createMany({
    data: departments,
  });

  console.log("Seeding Banners...");
  await prisma.bannerImage.createMany({
    data: bannerImages,
  });

  console.log("Seeding App Settings...");
  await prisma.appSettings.create({
    data: appSettings,
  });

  console.log("Seeding Working Days...");
  await prisma.workingDay.createMany({
    data: workingDays,
  });

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
