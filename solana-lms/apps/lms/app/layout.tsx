import { Space_Grotesk } from "next/font/google";
import "@workspace/ui/globals.css";
import { GlobalProviders, ThemeProviders } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";

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
        <GlobalProviders>
          <ThemeProviders>{children}</ThemeProviders>
        </GlobalProviders>
        <Toaster />
      </body>
    </html>
  );
}
