import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { type Pagination, buildHref, pageWindow } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type PaginationNavProps = {
  pagination: Pagination;
  pathname: string;
  /** Các tham số lọc hiện tại; được giữ nguyên khi chuyển trang. */
  params?: Record<string, string | number | null | undefined>;
};

export function PaginationNav({ pagination, pathname, params = {} }: PaginationNavProps) {
  const { page, totalPages, total, from, to, hasPrev, hasNext } = pagination;
  if (total === 0) return null;

  const hrefFor = (target: number) => buildHref(pathname, { ...params, page: target });
  const stepClass = buttonVariants({ variant: "outline", size: "sm" });

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-3 pt-6">
      <p className="text-sm text-muted-foreground">
        Hiển thị {from}–{to} trong {total} kết quả
      </p>

      {totalPages > 1 ? (
        <ul className="flex items-center gap-1">
          <li>
            {hasPrev ? (
              <Link href={hrefFor(page - 1)} rel="prev" className={stepClass}>
                <ChevronLeftIcon aria-hidden="true" />
                Trước
              </Link>
            ) : (
              <span aria-disabled="true" className={cn(stepClass, "pointer-events-none opacity-50")}>
                <ChevronLeftIcon aria-hidden="true" />
                Trước
              </span>
            )}
          </li>

          {pageWindow(page, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <li key={`ellipsis-${index}`} aria-hidden="true" className="hidden px-1 text-muted-foreground sm:block">
                …
              </li>
            ) : (
              <li key={item} className="hidden sm:block">
                <Link
                  href={hrefFor(item)}
                  aria-label={`Trang ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  className={buttonVariants({ variant: item === page ? "default" : "ghost", size: "icon-sm" })}
                >
                  {item}
                </Link>
              </li>
            ),
          )}

          <li className="px-2 text-sm text-muted-foreground sm:hidden">
            Trang {page}/{totalPages}
          </li>

          <li>
            {hasNext ? (
              <Link href={hrefFor(page + 1)} rel="next" className={stepClass}>
                Sau
                <ChevronRightIcon aria-hidden="true" />
              </Link>
            ) : (
              <span aria-disabled="true" className={cn(stepClass, "pointer-events-none opacity-50")}>
                Sau
                <ChevronRightIcon aria-hidden="true" />
              </span>
            )}
          </li>
        </ul>
      ) : null}
    </nav>
  );
}
