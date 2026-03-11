import { PAGE_SIZE } from "@/lib/constants";
import { useEffect, useState } from "react";

function usePaginatedReview(
  doctorId: string,
  initialPage: number = 1,
  reviewsPerPage: number = PAGE_SIZE,
) {}

export default usePaginatedReview;
