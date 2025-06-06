import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import ReactQueryClientProvider from "@/components/ReactQueryClientProvider";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CvParse- Resume To JSON",
  description: "Transform resumes into structured JSON instantly.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // with     </ReactQueryClientProvider> we  have now access to all rect query and hook it provide in whole app
    <ReactQueryClientProvider>
      <ClerkProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
          >
            <Navbar />
            <main className="mt-6">{children}</main>
            <Footer />
          </body>
        </html>
      </ClerkProvider>
    </ReactQueryClientProvider>
  );
}
