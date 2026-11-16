import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { DownloadIcon, InboxIcon, SearchIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { FilterForm } from "@/components/shared/filter-form";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { RegistrationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { RespondDialog } from "@/features/registrations/components/respond-dialog";
import { parseRegistrationFilters, registrationFilterParams } from "@/features/registrations/filters";
import { listRegistrationsForMyTopics } from "@/features/registrations/queries";
import { listMyTopicOptions } from "@/features/topics/queries";
import { REGISTRATION_STATUS_LABEL } from "@/lib/labels";
import { buildHref } from "@/lib/pagination";
import { formatDateTime } from "@/lib/text";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sinh viên đăng ký" };

const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: REGISTRATION_STATUS_LABEL.PENDING },
  { value: "ACCEPTED", label: REGISTRATION_STATUS_LABEL.ACCEPTED },
  { value: "REJECTED", label: REGISTRATION_STATUS_LABEL.REJECTED },
] as const;

export default function LecturerRegistrationsPage({ searchParams }: PageProps<"/lecturer/registrations">) {
  return (
    <>
      <PageHeader
        title="Sinh viên đăng ký"
        description="Thông tin liên hệ chỉ hiển thị cho giảng viên sở hữu đề tài."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Registrations searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Registrations({ searchParams }: Pick<PageProps<"/lecturer/registrations">, "searchParams">) {
  const filters = parseRegistrationFilters(await searchParams);
  const [{ registrations, pagination }, topics] = await Promise.all([
    listRegistrationsForMyTopics(filters),
    listMyTopicOptions(),
  ]);
  const params = registrationFilterParams(filters);

  return (
    <>
      <nav aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref("/lecturer/registrations", { ...params, status: tab.value === "ALL" ? "" : tab.value, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <FilterForm pathname="/lecturer/registrations" className="flex flex-wrap items-end gap-3">
          {/* Giữ nguyên trạng thái đang chọn khi lọc theo đề tài hoặc từ khoá. */}
          {filters.status !== "ALL" ? <input type="hidden" name="status" value={filters.status} /> : null}
          <div className="grid gap-1.5">
            <Label htmlFor="registration-topic">Đề tài</Label>
            <NativeSelect id="registration-topic" name="topic" defaultValue={filters.topicId} className="max-w-72">
              <NativeSelectOption value="">Tất cả đề tài</NativeSelectOption>
              {topics.map((topic) => (
                <NativeSelectOption key={topic.id} value={topic.id}>
                  {topic.title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="registration-q">Họ tên hoặc MSSV</Label>
            <Input id="registration-q" name="q" type="search" defaultValue={filters.q} maxLength={100} className="w-56" />
          </div>
          <Button type="submit" variant="outline">
            <SearchIcon aria-hidden="true" />
            Lọc
          </Button>
        </FilterForm>

        {pagination.total > 0 ? (
          <Button asChild variant="outline">
            {/* Tải tệp nên dùng thẻ <a> thường, không dùng <Link>. */}
            <a href={buildHref("/api/lecturer/registrations/export", { ...params, page: 1 })} download>
              <DownloadIcon aria-hidden="true" />
              Xuất CSV
            </a>
          </Button>
        ) : null}
      </div>

      {registrations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={InboxIcon}
            title="Không có đăng ký nào"
            description="Chưa có sinh viên đăng ký, hoặc không có đăng ký nào khớp bộ lọc hiện tại."
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y border-y">
          {registrations.map((item) => (
            <li key={item.id} className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-sans text-base font-semibold">{item.student.name}</h2>
                  <RegistrationStatusBadge status={item.status} />
                </div>

                <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">MSSV</dt>
                    <dd className="tabular-nums">{item.studentCode}</dd>
                  </div>
                  {item.className ? (
                    <div className="flex gap-1.5">
                      <dt className="text-muted-foreground">Lớp</dt>
                      <dd>{item.className}</dd>
                    </div>
                  ) : null}
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>
                      <a href={`mailto:${item.student.email}`} className="text-link hover:underline">
                        {item.student.email}
                      </a>
                    </dd>
                  </div>
                  {item.phone ? (
                    <div className="flex gap-1.5">
                      <dt className="text-muted-foreground">Điện thoại</dt>
                      <dd>
                        <a href={`tel:${item.phone}`} className="text-link hover:underline">
                          {item.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">Đề tài: </span>
                  <Link href={`/topics/${item.topic.id}`} className="hover:text-link hover:underline">
                    {item.topic.title}
                  </Link>
                </p>

                {item.message ? (
                  <p className="user-text mt-3 rounded-md bg-muted px-3 py-2 text-sm">{item.message}</p>
                ) : null}

                {item.lecturerNote ? (
                  <p className="user-text mt-3 border-l-2 border-primary pl-3 text-sm">
                    <span className="block text-xs text-muted-foreground">Phản hồi của bạn</span>
                    {item.lecturerNote}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-start">
                <time dateTime={item.createdAt.toISOString()} className="text-xs text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </time>
                <RespondDialog
                  registration={{
                    id: item.id,
                    status: item.status,
                    lecturerNote: item.lecturerNote,
                    studentName: item.student.name,
                    topicTitle: item.topic.title,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <PaginationNav pagination={pagination} pathname="/lecturer/registrations" params={params} />
    </>
  );
}
