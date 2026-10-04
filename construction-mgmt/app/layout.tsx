import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Multi Systems | Construction Management",
  description: "مالتي سيستمز - الشركة الرائدة في أعمال التشطيبات السكنية والمقاولات العامة. نقدم حلولاً متكاملة لإدارة المشاريع باحترافية.",
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
