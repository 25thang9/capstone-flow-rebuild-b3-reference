import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listDepartments, listTags } from "@/features/catalog/queries";
import { TopicFilterForm } from "@/features/topics/components/topic-filter-form";
import { TopicList, TopicListSkeleton } from "@/features/topics/components/topic-list";
import { type SearchParams, hasActiveFilters, parseTopicFilters, topicFilterParams } from "@/features/topics/filters";
import { listPublicTopics } from "@/features/topics/queries";

export const metadata: Metadata = {
  title: "Kho đề tài",
  description: "Tìm kiếm và lọc đề tài đồ án theo bộ môn, thẻ công nghệ và trạng thái nhận sinh viên.",
};

export default function TopicsPage({ searchParams }: PageProps<"/topics">) {
  return (
    <div className="container-page py-10">
      <PageHeader
        title="Kho đề tài"
        description="Lọc theo bộ môn, thẻ hoặc từ khoá. Bấm vào tên đề tài để xem chi tiết và gửi đăng ký."
        crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Kho đề tài" }]}
      />
      {/* searchParams là dữ liệu của từng request nên phần đọc nó phải nằm trong Suspense. */}
      <Suspense
        fallback={
          <>
            <Skeleton className="h-24 w-full" />
            <div className="mt-8">
              <TopicListSkeleton count={5} />
            </div>
          </>
        }
      >
        <TopicResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function TopicResults({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseTopicFilters(await searchParams);
  const [{ topics, pagination }, departments, tags] = await Promise.all([
    listPublicTopics(filters),
    listDepartments(),
    listTags(),
  ]);

  return (
    <>
      <TopicFilterForm filters={filters} departments={departments} tags={tags} />

      <p className="mt-8 mb-3 text-sm text-muted-foreground" role="status">
        {pagination.total === 0
          ? "Không có đề tài nào khớp bộ lọc."
          : `Tìm thấy ${pagination.total} đề tài · Trang ${pagination.page}/${pagination.totalPages}`}
      </p>

      {topics.length > 0 ? (
        <TopicList topics={topics} headingLevel={2} />
      ) : (
        <EmptyState
          icon={SearchXIcon}
          title="Không tìm thấy đề tài phù hợp"
          description={
            hasActiveFilters(filters)
              ? "Thử bỏ bớt điều kiện lọc hoặc dùng từ khoá ngắn hơn."
              : "Hiện chưa có đề tài nào đang nhận sinh viên."
          }
          action={
            hasActiveFilters(filters) ? (
              <Button asChild variant="outline">
                <Link href="/topics">Xoá toàn bộ bộ lọc</Link>
              </Button>
            ) : undefined
          }
        />
      )}

      <PaginationNav pagination={pagination} pathname="/topics" params={topicFilterParams(filters)} />
    </>
  );
}
