"use server";

import { ServerActionResponse, DoctorSummary } from "@/types";
import { prisma } from "@/db/prisma";

export async function getOurDoctors(): Promise<
  ServerActionResponse<DoctorSummary[]>
> {
  try {
    // 1. Fetch users with the DOCTOR role
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      include: {
        doctorProfile: true, // For the specialty
        doctorTestimonials: {
          // For ratings (testimonials)
          select: {
            rating: true,
          },
        },
      },
    });

    // 2. Map the data to your DoctorSummary type
    const data: DoctorSummary[] = doctors.map((doc) => {
      const ratings = doc.doctorTestimonials.map((r) => r.rating || 0);
      const totalRating = ratings.reduce((acc, curr) => acc + curr, 0);
      const averageRating =
        ratings.length > 0 ? totalRating / ratings.length : 0;

      return {
        id: doc.id,
        name: doc.name,
        specialty: doc.doctorProfile?.specialty || "General Medicine",
        imageUrl: doc.image,
        rating: parseFloat(averageRating.toFixed(1)), // e.g., 4.5
        reviewCount: ratings.length,
      };
    });

    return {
      success: true,
      message: "Doctors retrieved successfully",
      data: data,
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      error: "Failed to fetch doctors data.",
      errorType: "DATABASE_ERROR",
    };
  }
}
