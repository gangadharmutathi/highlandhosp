"use server";

import { ServerActionResponse, DoctorSummary, DoctorDetails } from "@/types";
import { prisma } from "@/db/prisma";

export async function getOurDoctors(): Promise<
  ServerActionResponse<DoctorSummary[]>
> {
  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      include: {
        doctorProfile: true,
      },
    });

    const data: DoctorSummary[] = doctors.map((doc) => {
      return {
        id: doc.id,
        name: doc.name,
        specialty: doc.doctorProfile?.specialty || "General Medicine",
        imageUrl: doc.image,
        rating: doc.doctorProfile?.rating ?? 0,
        reviewCount: doc.doctorProfile?.reviewCount ?? 0,
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

export async function getDoctorDetails(
  doctorId: string,
): Promise<ServerActionResponse<DoctorDetails>> {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: {
        userId: doctorId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!doctorProfile) {
      return {
        success: false,
        error: "Doctor not found",
      };
    }

    const doctorDetails: DoctorDetails = {
      id: doctorProfile.profileId,
      name: doctorProfile.user.name,
      specialty: doctorProfile.specialty,
      rating: doctorProfile.rating,
      reviewCount: doctorProfile.reviewCount,
      imageUrl: doctorProfile.user.image ?? "",
      brief: doctorProfile.brief,
      credentials: doctorProfile.credentials,
      languages: doctorProfile.languages,
      specializations: doctorProfile.specializations,
    };

    return {
      success: true,
      data: doctorDetails,
    };
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return {
      success: false,
      error: "Failed to fetch doctor details",
    };
  }
}
