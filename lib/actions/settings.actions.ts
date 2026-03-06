"use server";

import { prisma } from "@/db/prisma";
import {
  ServerActionResponse,
  DepartmentsData,
  BannerImageData,
} from "@/types";

interface GetDepartmentsData {
  departments: DepartmentsData[];
}

export async function getDepartments(): Promise<
  ServerActionResponse<GetDepartmentsData>
> {
  try {
    // Fetch all departments from the 'highland' schema via Prisma
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc", // Optional: alphabetize the list for the UI
      },
    });

    return {
      success: true,
      message: "Departments retrieved successfully",
      data: {
        departments: departments as DepartmentsData[],
      },
    };
  } catch (error) {
    console.error("Error fetching departments:", error);

    return {
      success: false,
      error: "Failed to fetch departments from the database.",
      errorType: "DATABASE_ERROR",
    };
  }
}

export async function getBannerImages(): Promise<
  ServerActionResponse<BannerImageData[]>
> {
  try {
    // We fetch and sort by 'order' so the UI shows them in sequence
    const bannerImages = await prisma.bannerImage.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return {
      success: true,
      message: "Banner images retrieved successfully",
      data: bannerImages as BannerImageData[],
    };
  } catch (error) {
    console.error("Error fetching banner images:", error);
    return {
      success: false,
      error: "Failed to fetch banner images.",
      errorType: "DATABASE_ERROR",
    };
  }
}
