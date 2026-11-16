import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClockIcon, FileTextIcon, InboxIcon, PlusIcon, UserCheckIcon, UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { RegistrationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationsByTopicChart } from "@/features/stats/components/charts";
import { getLecturerOverview } from "@/features/stats/queries";
import { formatDate } from "@/lib/text";

export const metadata: Metadata = { title: "Tổng quan giảng viên" };

export default function LecturerDashboardPage() {
  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Tình hình đề tài và đăng ký của bạn."
        actions={
          <Button asChild>
            <Link href="/lecturer/topics/new">
              <PlusIcon aria-hidden="true" />
              Thêm đề tài
            </Link>
          </Button>
        }
      />
      <Suspense
        fallback={
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="mt-8 h-72 w-full" />
          </>
        }
      >
        <Overview />
      </Suspense>
    </>
  );
}

async function Overview() {
  const { totals, chart, recent } = await getLecturerOverview();

  return (
    <>
      <StatGrid
        stats={[
          { label: "Đề tài", value: totals.topics, hint: `${totals.openTopics} đang nhận`, href: "/lecturer/topics", icon: FileTextIcon },
          {
            label: "Chờ phản hồi",
            value: totals.pending,
            hint: totals.pending > 0 ? "Cần bạn xử lý" : "Không có gì đang chờ",
            href: "/lecturer/registrations?status=PENDING",
            icon: ClockIcon,
          },
          { label: "Đã nhận", value: totals.accepted, href: "/lecturer/registrations?status=ACCEPTED", icon: UserCheckIcon },
          { label: "Tổng lượt đăng ký", value: totals.registrations, href: "/lecturer/registrations", icon: UsersIcon },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-labelledby="chart-heading">
          <h2 id="chart-heading" className="text-xl font-semibold">
            Đăng ký theo đề tài
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">Tối đa 6 đề tài có nhiều lượt đăng ký nhất.</p>
          {chart.length > 0 ? (
            <div className="rounded-lg border bg-card p-4">
              <RegistrationsByTopicChart data={chart} />
            </div>
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Chưa có lượt đăng ký nào"
              description="Biểu đồ sẽ xuất hiện khi có sinh viên đăng ký đề tài của bạn."
            />
          )}
        </section>

        <section aria-labelledby="recent-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="recent-heading" className="text-xl font-semibold">
              Đăng ký gần đây
            </h2>
            <Link href="/lecturer/registrations" className="text-sm font-medium text-link hover:underline">
              Xem tất cả
            </Link>
          </div>
          {recent.length > 0 ? (
            <ul className="mt-4 divide-y border-y">
              {recent.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{item.student.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{item.topic.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                  <RegistrationStatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Chưa có sinh viên nào đăng ký.</p>
          )}
        </section>
      </div>
    </>
  );
}
