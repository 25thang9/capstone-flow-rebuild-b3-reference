import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";

const MAIN_LINKS = [
  { href: "/topics", label: "Kho đề tài" },
  { href: "/about", label: "Giới thiệu" },
];

export function SiteHeader() {
  return (
    <>
      <div className="bg-brand text-brand-foreground">
        <div className="container-page flex min-h-8 items-center justify-between gap-4 py-1.5 text-xs">
          <span>Khoa Vật lý – Vật lý Kỹ thuật · Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM</span>
          <span className="hidden shrink-0 md:inline">Đồ án môn học PHY10615</span>
        </div>
      </div>

      {/* Thanh điều hướng dính trên cùng khi cuộn; nền hơi trong và làm mờ phía sau để vẫn đọc rõ. */}
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/75">
        <div className="container-page flex flex-wrap items-center gap-x-6">
          <Link
            href="/"
            className="flex h-16 items-center gap-3 transition-opacity hover:opacity-80"
            aria-label="CapstoneFlow – về trang chủ"
          >
            {/* Logo gốc màu xanh đậm; ở chế độ tối chuyển thành trắng để đủ tương phản. */}
            <Image
              src="/images/logo-khoa-vat-ly.png"
              alt=""
              width={147}
              height={36}
              priority
              className="dark:brightness-0 dark:invert"
            />
            <span className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
            <span className="hidden leading-tight sm:block">
              <span className="block font-heading text-lg font-semibold">CapstoneFlow</span>
              <span className="block text-xs text-muted-foreground">Kho đề tài đồ án</span>
            </span>
          </Link>

          {/* Màn hình hẹp: menu xuống dòng thứ hai thay vì ẩn sau nút ba gạch. */}
          <nav
            aria-label="Điều hướng chính"
            className="order-last -mx-4 flex w-[calc(100%+2rem)] gap-1 border-t px-4 sm:order-none sm:mx-0 sm:w-auto sm:border-0 sm:px-0"
          >
            {/* usePathname cần ranh giới Suspense khi trang có tham số động (/topics/[id]). */}
            <Suspense fallback={MAIN_LINKS.map((link) => <NavLink key={link.href} {...link} staticOnly />)}>
              {MAIN_LINKS.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </Suspense>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {/* Phần đọc phiên đăng nhập được stream sau; khung trang hiển thị ngay. */}
            <Suspense fallback={<Skeleton className="h-9 w-28" />}>
              <UserNav />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
}
