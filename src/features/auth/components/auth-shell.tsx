import { redirect } from "next/navigation";
import { CheckIcon } from "lucide-react";

import { getCurrentUser } from "@/lib/dal";
import { homePathFor, safeRedirectPath } from "@/lib/roles";

type SearchParams = Record<string, string | string[] | undefined>;

const HIGHLIGHTS = [
  "Xem và lọc đề tài theo bộ môn, công nghệ",
  "Đăng ký trực tuyến, rút lại khi chưa có phản hồi",
  "Theo dõi kết quả và lời nhắn của giảng viên",
];

/**
 * Khung chung của trang đăng nhập / đăng ký.
 * Màn hình rộng: bảng giới thiệu màu Khoa bên trái, form bên phải. Màn hình hẹp: chỉ còn form.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-xl border bg-card shadow-card lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <aside className="relative isolate hidden overflow-hidden bg-brand p-10 text-brand-foreground lg:block">
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]"
          />
          <p className="font-heading text-2xl font-semibold">CapstoneFlow</p>
          <p className="mt-2 text-white/75">Kho đề tài đồ án của Khoa Vật lý – Vật lý Kỹ thuật.</p>
          <ul className="mt-10 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15"
                >
                  <CheckIcon className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="animate-rise p-6 sm:p-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Đọc ?next= và chặn người đã đăng nhập quay lại trang đăng nhập.
 * Trả về đường dẫn `next` hợp lệ (hoặc undefined) cho form.
 */
export async function resolveAuthNext(searchParams: Promise<SearchParams>): Promise<string | undefined> {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const next = safeRedirectPath(params.next, "");
  if (user) redirect(next || homePathFor(user.role));
  return next || undefined;
}
