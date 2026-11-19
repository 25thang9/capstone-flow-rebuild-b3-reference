import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

import { MobileNavMenu } from "./mobile-nav-menu";
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
      {/* Thanh điều hướng dính trên cùng khi cuộn; nền hơi trong và làm mờ phía sau để vẫn đọc rõ. */}
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/75">
        <div className="container-page flex flex-wrap items-center gap-x-6">
          <Link
            href="/"
            className="flex h-16 shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
            aria-label="CapstoneFlow – về trang chủ"
          >
            {/* Logo gốc màu xanh đậm; ở chế độ tối chuyển thành trắng để đủ tương phản. */}
            <Image
              src="/images/logo-team.png"
              alt=""
              width={120}
              height={29}
              sizes="(min-width: 768px) 96px, 80px"
              priority
              className="h-auto w-20 dark:brightness-0 dark:invert md:w-24"
            />
            <Image
              src="/images/Logo_project.png"
              alt=""
              width={96}
              height={64}
              sizes="(min-width: 768px) 96px, 80px"
              priority
              className="h-[3.375rem] w-20 object-contain dark:brightness-0 dark:invert md:h-16 md:w-24"
            />
            <span className="hidden h-8 w-px bg-border md:block" aria-hidden="true" />
            <span className="hidden leading-tight md:block">
              <span className="block font-heading text-lg font-semibold">CapstoneFlow</span>
              <span className="block text-xs text-muted-foreground">Kho đề tài đồ án</span>
            </span>
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="hidden gap-1 lg:flex"
          >
            {/* usePathname cần ranh giới Suspense khi trang có tham số động (/topics/[id]). */}
            <Suspense fallback={MAIN_LINKS.map((link) => <NavLink key={link.href} {...link} staticOnly />)}>
              {MAIN_LINKS.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </Suspense>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <ThemeToggle />
              {/* Phần đọc phiên đăng nhập được stream sau; khung trang hiển thị ngay. */}
              <Suspense fallback={<Skeleton className="h-9 w-28" />}>
                <UserNav />
              </Suspense>
            </div>
            <MobileNavMenu links={MAIN_LINKS}>
              <div className="flex flex-col gap-1">
                <ThemeToggle fullWidth />
                <Suspense
                  fallback={
                    <div className="space-y-2">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  }
                >
                  <UserNav mobile />
                </Suspense>
              </div>
            </MobileNavMenu>
          </div>
        </div>
      </header>
    </>
  );
}
