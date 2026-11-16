"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Chế độ sáng / tối. Mặc định theo cài đặt của hệ điều hành; lựa chọn của người dùng được lưu lại.
 * next-themes gắn class "dark" lên <html>, và các biến màu trong globals.css đổi giá trị theo class đó.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
