import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGAP — Disaster Response System",
  description: "Sistem Informasi Geospasial Agent Platform — AI-powered disaster response coordination for Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
