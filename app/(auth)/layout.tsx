// app/(auth)/layout.tsx
//
// Shared layout for all auth pages (sign-in, sign-up).
//
// Why a separate layout from app/layout.tsx?
// The main app layout includes your navbar, footer, and other chrome.
// Auth pages look better without those — just a clean centered card.
// Next.js route groups let us have a completely separate layout for (auth)
// pages without affecting the URL structure.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Full screen height, centered content both vertically and horizontally
    // bg-gray-50 gives a subtle off-white background matching the clinic's
    // clean aesthetic
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Clinic branding above the card */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">
            Highland Medical Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Excellence in Healthcare, Committed to Your Well-being
          </p>
        </div>

        {/* The actual sign-in or sign-up card renders here */}
        {children}
      </div>
    </div>
  );
}
