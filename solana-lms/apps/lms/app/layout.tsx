import { Space_Grotesk } from "next/font/google";
import "@workspace/ui/globals.css";
import { GlobalProviders, ThemeProviders } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";
import { Suspense } from "react";
import { NavigationLoader,  } from "@/components/navigation-progress";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${space_grotesk.variable} font-sans antialiased `}>
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        <GlobalProviders>
          <ThemeProviders>{children}</ThemeProviders>
        </GlobalProviders>
        <Toaster />
      </body>
    </html>
  );
}
