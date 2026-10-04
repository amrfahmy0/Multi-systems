import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Multi Systems | Construction Management",
  description: "نظام شامل لإدارة مشاريع التشطيبات السكنية - المالية والمشتريات والمهام والمستندات",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col text-foreground bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
