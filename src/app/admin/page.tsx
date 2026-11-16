import { Suspense } from "react";
import type { Metadata } from "next";

import { ClipboardListIcon, FileTextIcon, GraduationCapIcon, UsersIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicsByDepartmentChart } from "@/features/stats/components/charts";
import { getAdminOverview } from "@/features/stats/queries";
import { REGISTRATION_STATUS_LABEL } from "@/lib/labels";

export const metadata: Metadata = { title: "Quản trị" };

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="Tổng quan hệ thống" description="Số liệu tổng hợp của toàn bộ đề tài và đăng ký." />
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
  const { users, topics, registrations, topicsByDepartment } = await getAdminOverview();
  const totalRegistrations = registrations.pending + registrations.accepted + registrations.rejected;

  const statusRows = [
    { label: REGISTRATION_STATUS_LABEL.ACCEPTED, value: registrations.accepted, barClass: "bg-chart-3" },
    { label: REGISTRATION_STATUS_LABEL.PENDING, value: registrations.pending, barClass: "bg-chart-4" },
    { label: REGISTRATION_STATUS_LABEL.REJECTED, value: registrations.rejected, barClass: "bg-chart-5" },
  ];

  return (
    <>
      <StatGrid
        stats={[
          { label: "Sinh viên", value: users.students, href: "/admin/users?role=STUDENT", icon: UsersIcon },
          { label: "Giảng viên", value: users.lecturers, href: "/admin/users?role=LECTURER", icon: GraduationCapIcon },
          { label: "Đề tài", value: topics.open + topics.closed, hint: `${topics.open} đang nhận`, icon: FileTextIcon },
          { label: "Lượt đăng ký", value: totalRegistrations, hint: `${registrations.pending} chờ phản hồi`, icon: ClipboardListIcon },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-labelledby="department-chart-heading">
          <h2 id="department-chart-heading" className="mb-4 text-xl font-semibold">
            Đề tài theo bộ môn
          </h2>
          <div className="rounded-lg border bg-card p-4">
            <TopicsByDepartmentChart data={topicsByDepartment} />
          </div>
        </section>

        <section aria-labelledby="status-heading">
          <h2 id="status-heading" className="mb-4 text-xl font-semibold">
            Đăng ký theo trạng thái
          </h2>
          {/* Thanh tỉ lệ thuần CSS: không cần thư viện biểu đồ, và trình đọc màn hình đọc được trực tiếp. */}
          <dl className="space-y-4 rounded-lg border bg-card p-5">
            {statusRows.map((row) => {
              const percent = totalRegistrations === 0 ? 0 : Math.round((row.value / totalRegistrations) * 100);
              return (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <dt>{row.label}</dt>
                    <dd className="font-medium tabular-nums">
                      {row.value} <span className="font-normal text-muted-foreground">({percent}%)</span>
                    </dd>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </dl>
        </section>
      </div>
    </>
  );
}
