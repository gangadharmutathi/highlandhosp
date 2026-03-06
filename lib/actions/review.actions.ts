"use server";

import { ServerActionResponse, DoctorReviews } from "@/types";
import { getAppTimeZone } from "@/lib/config";
import { prisma } from "@/db/prisma";
import { formatInTimeZone } from "date-fns-tz";

export async function getDoctorReviews(): Promise<
  ServerActionResponse<DoctorReviews[]>
> {
  try {
    const timeZone = getAppTimeZone();

    // 1. Fetch testimonials including the patient (User) who wrote it
    const testimonials = await prisma.doctorTestimonial.findMany({
      take: 3, // Adjust this number based on how many you want to show
      orderBy: {
        createdAt: "desc", // Show newest reviews first
      },
      include: {
        patient: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // 2. Map the data to your DoctorReviews type
    const data: DoctorReviews[] = testimonials.map((t) => {
      return {
        id: t.testimonialId,
        patientName: t.patient?.name || "Verified Patient",
        rating: t.rating,
        testimonialText: t.testimonialText,
        patientImage: t.patient?.image || null,
        // Convert UTC to Local Timezone
        reviewDate: t.createdAt
          ? formatInTimeZone(
              new Date(t.createdAt),
              timeZone,
              "dd MMM yyyy 'at' HH:mm",
            )
          : null,
      };
    });

    return {
      success: true,
      message: "Reviews retrieved successfully",
      data: data,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {
      success: false,
      error: "Failed to fetch testimonials.",
      errorType: "DATABASE_ERROR",
    };
  }
}
