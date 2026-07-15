import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiberSadar UMKM — Latihan Sesuai Peran",
  description: "Materi, asesmen, dan bukti penyelesaian keamanan siber berbasis peran untuk peserta UMKM.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
