import Image from "next/image";
import { getBannerImages } from "@/lib/actions/settings.actions";

export default async function HomeBanner() {
  // 1. Fetch live banner data from Supabase
  const response = await getBannerImages();

  // 2. Extract the first banner based on the 'order' we defined in the action
  const banner =
    response.success && response.data && response.data.length > 0
      ? response.data[0]
      : null;

  // 3. Fallback state if no image is found in the database
  if (!banner) {
    return (
      <div className="flex h-[200px] items-center justify-center bg-muted text-muted-foreground rounded-lg">
        <p>No Banner information available.</p>
      </div>
    );
  }

  return (
    <section className="relative h-75 w-full max-w-[1440px] mx-auto md:h-100 lg:h-125 overflow-hidden">
      {/* Background Image - Powered by Supabase */}
      <div className="absolute inset-0 z-0">
        <Image
          src={banner.imageUrl}
          alt={banner.name}
          fill
          priority // Keeps LCP (Largest Contentful Paint) high
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark Overlay for text legibility */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Container */}
      <div className="container relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="text-text-caption-2 text-center text-4xl md:text-5xl font-bold">
          Welcome to Highland Medical Center
        </h1>
        <h4 className="mt-6 text-text-caption-2 opacity-90 text-lg md:text-xl max-w-2xl">
          Excellence in Healthcare, Committed to Your Well-being.
        </h4>
      </div>
    </section>
  );
}
