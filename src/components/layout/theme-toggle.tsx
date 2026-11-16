"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/** Nút đổi chế độ sáng / tối. Hai biểu tượng cùng được vẽ sẵn và ẩn/hiện bằng CSS, nên không bị lệch khi hydrate. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Đổi chế độ sáng / tối"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="hidden dark:block" aria-hidden="true" />
      <MoonIcon className="dark:hidden" aria-hidden="true" />
    </Button>
  );
}
