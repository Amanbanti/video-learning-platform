import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "../components/theme-provider";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "../components/Footer";
import ClientThemeSync from "../components/ClientThemeSync";

export const metadata: Metadata = {
  title: "A++",
  description: "Premium video courses for Natural and Social sciences",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClientThemeSync />
          <Suspense fallback={null}>
            {children}
            <Footer />
          </Suspense>
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
