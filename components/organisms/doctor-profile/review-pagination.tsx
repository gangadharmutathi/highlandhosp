// components/organisms/doctor-profile/review-pagination.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewPaginationProps {
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  pageSize: number;
}

export default function ReviewPagination({
  currentPage,
  totalPages,
  totalReviews,
  pageSize,
}: ReviewPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Calculate showing range e.g. "Showing 1-10 of 527 reviews"
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalReviews);

  // Build page number buttons with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1, 2, 3];

    if (currentPage > 4) {
      pages.push("...");
    }

    if (currentPage > 3 && currentPage < totalPages - 1) {
      pages.push(currentPage);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      {/* Left: Showing X-Y of Z reviews */}
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {/* Right: Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted-foreground"
            >
              •••
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateToPage(page as number)}
              className="size-8 p-0 text-sm"
            >
              {page}
            </Button>
          ),
        )}

        {/* Next */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 text-sm"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
