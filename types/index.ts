import { Department, BannerImage } from "@/db/generated/client";

export interface ServerActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorType?: string;
}

export type DepartmentsData = Department;

export type DoctorSummary = {
  id: string | null;
  name: string | null;
  specialty: string | null;
  rating: number | null;
  reviewCount: number | null;
  imageUrl: string | null;
};

export type DoctorReviews = {
  id: string | null;
  patientName: string | null;
  rating: number | null;
  testimonialText: string | null;
  reviewDate: string | null;
  patientImage: string | null;
};

export type BannerImageData = BannerImage;

export interface DoctorDetails {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  brief: string;
  credentials: string;
  languages: string[];
  specializations: string[];
}
