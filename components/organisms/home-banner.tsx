import Image from "next/image";
import { bannerImageData } from "@/db/dummydata";

export default function HomeBanner() {
  // Check if data exists
  const banner =
    bannerImageData && bannerImageData.length > 0 ? bannerImageData[0] : null;

  if (!banner) {
    return (
      <div className="flex h-[200px] items-center justify-center bg-muted text-muted-foreground">
        {/* No Banner information available. */}
        <p>No Banner information available.</p>
      </div>
    );
  }

  return (
    <section className="relative h-75 w-full max-w-[1440px] mx-auto md:h-100 lg:h-125 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={banner.imageUrl}
          alt={banner.name}
          fill
          priority
          className="object-cover"
        />
        {/* Dark Overlay for text legibility */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Container */}
      <div className="container relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="text-text-caption-2 text-center">
          Welcome to Highland Medical Center
        </h1>
        <h4 className="mt-6 text-text-caption-2 opacity-90">
          Excellence in Healthcare, Committed to Your Well-being.
        </h4>
      </div>
    </section>
  );
}
