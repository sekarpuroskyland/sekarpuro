import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// METADATA DENGAN ICON SKYVIA (OTOMATIS MENGGANTI ICON TAB)
export const metadata: Metadata = {
  title: "Skyvia - Resident Portal",
  description: "Sistem Informasi Warga Skyvia Digital",
  icons: {
    icon: "/images/skyvia.png", // Mengarahkan langsung ke logo Skyvia King
    shortcut: "/images/skyvia.png",
    apple: "/images/skyvia.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}