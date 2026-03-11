"use server";

import { ServerActionResponse, DoctorReviews } from "@/types";
import { getAppTimeZone } from "@/lib/config";
import { prisma } from "@/db/prisma";
import { formatInTimeZone } from "date-fns-tz";
import { PAGE_SIZE } from "@/lib/constants";

export async function getDoctorReviews(
  doctorId: string,
): Promise<ServerActionResponse<DoctorReviews[]>> {
  try {
    const timeZone = getAppTimeZone();

    const testimonials = await prisma.doctorTestimonial.findMany({
      where: {
        doctorId: doctorId,
      },
      take: 3,
      orderBy: {
        createdAt: "desc",
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

    const data: DoctorReviews[] = testimonials.map((t) => {
      return {
        id: t.testimonialId,
        patientName: t.patient?.name || "Verified Patient",
        rating: t.rating,
        testimonialText: t.testimonialText,
        patientImage: t.patient?.image || null,
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

export interface PaginatedReviewsResponse {
  reviews: DoctorReviews[];
  totalPages: number;
  currentPage: number;
  totalReviews: number;
}

export async function getDoctorReviewsPaginated(
  doctorId: string,
  page: number = 1,
  pageSize: number = PAGE_SIZE,
): Promise<ServerActionResponse<PaginatedReviewsResponse>> {
  try {
    const timeZone = getAppTimeZone();

    // Ensure page is always at least 1
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * pageSize;
    console.log("Querying reviews for doctorId:", doctorId);
    // Run count and data fetch in parallel for efficiency
    const [totalReviews, testimonials] = await Promise.all([
      prisma.doctorTestimonial.count({
        where: { doctorId },
      }),
      prisma.doctorTestimonial.findMany({
        where: { doctorId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          patient: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
    ]);
    console.log("Total reviews found:", totalReviews);

    const totalPages = Math.ceil(totalReviews / pageSize);

    const reviews: DoctorReviews[] = testimonials.map((t) => ({
      id: t.testimonialId,
      patientName: t.patient?.name || "Verified Patient",
      rating: t.rating,
      testimonialText: t.testimonialText,
      patientImage: t.patient?.image || null,
      reviewDate: t.createdAt
        ? formatInTimeZone(
            new Date(t.createdAt),
            timeZone,
            "dd MMM yyyy 'at' HH:mm",
          )
        : null,
    }));

    return {
      success: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews,
        totalPages,
        currentPage,
        totalReviews,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated reviews:", error);
    return {
      success: false,
      error: "Failed to fetch reviews.",
      errorType: "DATABASE_ERROR",
    };
  }
}
