"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { buildHref } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type FilterFormProps = {
  /** Trang nhận bộ lọc, ví dụ "/topics". */
  pathname: string;
  /** Giá trị mặc định của từng ô; trùng mặc định thì không đưa lên URL. */
  defaults?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
};

/**
 * Form lọc ghi trạng thái lên URL (searchParams) thay vì giữ trong state.
 * - Không có JavaScript vẫn chạy: đây là form GET bình thường.
 * - Có JavaScript: URL được dọn gọn (bỏ ô rỗng, bỏ giá trị mặc định, quay về trang 1)
 *   và ô chọn tự áp dụng ngay khi đổi giá trị.
 */
export function FilterForm({ pathname, defaults = {}, className, children }: FilterFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const params: Record<string, string> = {};
    for (const [key, value] of new FormData(form).entries()) {
      const text = String(value).trim();
      if (text && text !== defaults[key]) params[key] = text;
    }
    startTransition(() => router.push(buildHref(pathname, params)));
  }

  return (
    <form
      action={pathname}
      method="get"
      role="search"
      aria-busy={pending}
      className={cn("transition-opacity", pending && "opacity-60", className)}
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
      onChange={(event) => {
        if (event.target instanceof HTMLSelectElement) apply(event.currentTarget);
      }}
    >
      {children}
    </form>
  );
}
