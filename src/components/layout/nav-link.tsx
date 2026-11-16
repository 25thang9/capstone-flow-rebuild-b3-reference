"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

// Gạch chân là phần tử ::after trượt ra từ trái khi rê chuột, và nằm cố định ở mục đang xem.
const baseClass =
  "relative inline-flex h-11 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:h-16 " +
  "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100";

type NavLinkProps = {
  href: string;
  label: string;
  /** Khớp chính xác đường dẫn thay vì khớp theo tiền tố (dùng cho tab "Tổng quan"). */
  exact?: boolean;
  /** Bản dựng sẵn không đọc pathname – dùng làm fallback của Suspense. */
  staticOnly?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function NavLink(props: NavLinkProps) {
  if (props.staticOnly) {
    return (
      <Link href={props.href} className={cn(baseClass, props.className)}>
        {props.label}
        {props.children}
      </Link>
    );
  }
  return <ActiveNavLink {...props} />;
}

function ActiveNavLink({ href, label, exact, className, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(baseClass, active && "text-foreground after:scale-x-100", className)}
    >
      {label}
      {children}
    </Link>
  );
}
