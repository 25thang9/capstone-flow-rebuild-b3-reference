import type { Metadata } from "next";
import { Be_Vietnam_Pro, Source_Serif_4 } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

// next/font tự tải và host phông chữ: không gọi Google Fonts lúc chạy, không bị giật chữ.
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "vietnamese"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CapstoneFlow – Kho đề tài đồ án",
    template: "%s · CapstoneFlow",
  },
  description:
    "Tra cứu đề tài đồ án của Khoa Vật lý – Vật lý Kỹ thuật, gửi đăng ký và theo dõi phản hồi của giảng viên.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes gắn class "dark" vào <html> trước khi React chạy.
    <html lang="vi" className={`${beVietnam.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Bỏ qua, tới nội dung chính
        </a>
        <ThemeProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
