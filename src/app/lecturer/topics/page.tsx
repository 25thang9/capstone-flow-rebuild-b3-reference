import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FilePlusIcon, PlusIcon, SearchIcon, SearchXIcon } from "lucide-react";

import { ActionButton } from "@/components/shared/action-button";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterForm } from "@/components/shared/filter-form";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { AvailabilityBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAvailability } from "@/features/registrations/rules";
import { deleteTopicAction, setTopicStatusAction } from "@/features/topics/actions";
import { type SearchParams, lecturerTopicFilterParams, parseLecturerTopicFilters } from "@/features/topics/filters";
import { listMyTopics } from "@/features/topics/queries";
import { formatDate } from "@/lib/text";

export const metadata: Metadata = { title: "Đề tài của tôi" };

export default function LecturerTopicsPage({ searchParams }: PageProps<"/lecturer/topics">) {
  return (
    <>
      <PageHeader
        title="Đề tài của tôi"
        description="Bạn chỉ thấy và chỉ sửa được đề tài do chính mình đăng."
        actions={
          <Button asChild>
            <Link href="/lecturer/topics/new">
              <PlusIcon aria-hidden="true" />
              Thêm đề tài
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <MyTopics searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function MyTopics({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseLecturerTopicFilters(await searchParams);
  const { topics, pagination } = await listMyTopics(filters);
  const filtering = Boolean(filters.q) || filters.status !== "ALL";

  return (
    <>
      <FilterForm pathname="/lecturer/topics" defaults={{ status: "ALL" }} className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-56 flex-1 gap-1.5 sm:max-w-sm">
          <Label htmlFor="topic-q">Tìm theo tên đề tài</Label>
          <Input id="topic-q" name="q" type="search" defaultValue={filters.q} maxLength={100} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="topic-status">Trạng thái</Label>
          <NativeSelect id="topic-status" name="status" defaultValue={filters.status}>
            <NativeSelectOption value="ALL">Tất cả</NativeSelectOption>
            <NativeSelectOption value="OPEN">Đang nhận</NativeSelectOption>
            <NativeSelectOption value="CLOSED">Đã đóng</NativeSelectOption>
          </NativeSelect>
        </div>
        <Button type="submit" variant="outline">
          <SearchIcon aria-hidden="true" />
          Lọc
        </Button>
      </FilterForm>

      {topics.length === 0 ? (
        <div className="mt-6">
          {filtering ? (
            <EmptyState
              icon={SearchXIcon}
              title="Không có đề tài khớp bộ lọc"
              action={
                <Button asChild variant="outline">
                  <Link href="/lecturer/topics">Xoá bộ lọc</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FilePlusIcon}
              title="Bạn chưa đăng đề tài nào"
              description="Đề tài sau khi đăng sẽ xuất hiện ngay trong Kho đề tài để sinh viên đăng ký."
              action={
                <Button asChild>
                  <Link href="/lecturer/topics/new">Đăng đề tài đầu tiên</Link>
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
          <Table className="min-w-[46rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Đề tài</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Đã nhận</TableHead>
                <TableHead className="text-right">Đang chờ</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="max-w-sm whitespace-normal">
                    <Link href={`/topics/${topic.id}`} className="font-medium hover:text-link hover:underline">
                      {topic.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{topic.department.name}</p>
                  </TableCell>
                  <TableCell>
                    <AvailabilityBadge availability={getAvailability(topic)} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {topic.acceptedCount}/{topic.maxStudents}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {topic.pendingCount > 0 ? (
                      <Link
                        href={`/lecturer/registrations?topic=${topic.id}&status=PENDING`}
                        className="font-medium text-link hover:underline"
                        aria-label={`${topic.pendingCount} đăng ký đang chờ của đề tài ${topic.title}`}
                      >
                        {topic.pendingCount}
                      </Link>
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell>{formatDate(topic.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/lecturer/topics/${topic.id}/edit`}>Sửa</Link>
                      </Button>
                      <ActionButton
                        variant="ghost"
                        size="sm"
                        action={setTopicStatusAction.bind(null, topic.id, topic.status === "OPEN" ? "CLOSED" : "OPEN")}
                      >
                        {topic.status === "OPEN" ? "Đóng" : "Mở lại"}
                      </ActionButton>
                      <ConfirmAction
                        trigger={
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Xoá
                          </Button>
                        }
                        title="Xoá đề tài này?"
                        description={
                          topic.registrationCount > 0
                            ? `“${topic.title}” đang có ${topic.registrationCount} lượt đăng ký; các đăng ký này sẽ bị xoá theo và không khôi phục được.`
                            : `“${topic.title}” sẽ bị xoá vĩnh viễn.`
                        }
                        confirmLabel="Xoá đề tài"
                        destructive
                        action={deleteTopicAction.bind(null, topic.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationNav pagination={pagination} pathname="/lecturer/topics" params={lecturerTopicFilterParams(filters)} />
    </>
  );
}
