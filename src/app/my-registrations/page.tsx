import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardListIcon } from "lucide-react";

import { ConfirmAction } from "@/components/shared/confirm-action";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RegistrationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { withdrawAction } from "@/features/registrations/actions";
import { listMyRegistrations } from "@/features/registrations/queries";
import { canWithdraw } from "@/features/registrations/rules";
import { formatDate } from "@/lib/text";

export const metadata: Metadata = { title: "Đăng ký của tôi" };

export default function MyRegistrationsPage() {
  return (
    <div className="container-page py-10">
      <PageHeader
        title="Đăng ký của tôi"
        description="Các đề tài bạn đã đăng ký và phản hồi của giảng viên."
        crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Đăng ký của tôi" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/topics">Tìm thêm đề tài</Link>
          </Button>
        }
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <MyRegistrations />
      </Suspense>
    </div>
  );
}

async function MyRegistrations() {
  // listMyRegistrations tự kiểm tra vai trò sinh viên và chỉ lấy đăng ký của người đang đăng nhập.
  const registrations = await listMyRegistrations();

  if (registrations.length === 0) {
    return (
      <EmptyState
        icon={ClipboardListIcon}
        title="Bạn chưa đăng ký đề tài nào"
        description="Vào Kho đề tài, chọn đề tài đang nhận sinh viên và gửi đăng ký."
        action={
          <Button asChild>
            <Link href="/topics">Xem kho đề tài</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="divide-y border-y">
      {registrations.map((registration) => (
        <li key={registration.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
          <div className="min-w-0">
            <h2 className="text-lg leading-snug font-semibold">
              <Link href={`/topics/${registration.topic.id}`} className="hover:text-link hover:underline">
                {registration.topic.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {registration.topic.lecturer.name} · Gửi ngày {formatDate(registration.createdAt)}
            </p>

            {registration.message ? (
              <p className="user-text mt-3 text-sm">
                <span className="text-muted-foreground">Lời nhắn của bạn: </span>
                {registration.message}
              </p>
            ) : null}

            {registration.lecturerNote ? (
              <blockquote className="user-text mt-3 border-l-2 border-primary pl-3 text-sm">
                <span className="block text-xs text-muted-foreground">
                  Phản hồi của giảng viên
                  {registration.respondedAt ? ` · ${formatDate(registration.respondedAt)}` : ""}
                </span>
                {registration.lecturerNote}
              </blockquote>
            ) : null}
          </div>

          <div className="flex items-start gap-3 sm:flex-col sm:items-end">
            <RegistrationStatusBadge status={registration.status} />
            {canWithdraw(registration.status) ? (
              <ConfirmAction
                trigger={
                  <Button variant="ghost" size="sm">
                    Rút đăng ký
                  </Button>
                }
                title="Rút đăng ký đề tài này?"
                description={`“${registration.topic.title}” – giảng viên sẽ không còn thấy đăng ký của bạn.`}
                confirmLabel="Rút đăng ký"
                destructive
                action={withdrawAction.bind(null, registration.id)}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
