import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InfiMagen — AI Content Platform",
  description: "Generate images, videos, thumbnails, scripts and more with AI",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080808] text-white">{children}</body>
    </html>
  );
}
