import Link from "next/link";

import { AvailabilityBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvailability } from "@/features/registrations/rules";
import { formatDate } from "@/lib/text";
import { cn } from "@/lib/utils";

import type { TopicCardData } from "../queries";

type HeadingLevel = 2 | 3;
type TopicListLayout = "rows" | "cards";

/** Thanh nhỏ cho thấy đề tài đã kín bao nhiêu chỗ. Chỉ để nhìn; con số đã có ở ngay bên cạnh. */
export function CapacityBar({ accepted, max, className }: { accepted: number; max: number; className?: string }) {
  const percent = max === 0 ? 0 : Math.min(100, Math.round((accepted / max) * 100));
  return (
    <span aria-hidden="true" className={cn("inline-block h-1.5 overflow-hidden rounded-full bg-muted", className)}>
      <span
        className={cn("block h-full rounded-full transition-[width] duration-500", percent >= 100 ? "bg-warning" : "bg-success")}
        style={{ width: `${percent}%` }}
      />
    </span>
  );
}

/** Một dòng đề tài trong danh sách công khai. Cả dòng bấm được nhờ liên kết phủ kín (after:inset-0). */
export function TopicRow({ topic, headingLevel = 3 }: { topic: TopicCardData; headingLevel?: HeadingLevel }) {
  // Cấp tiêu đề phụ thuộc trang chứa nó, để dàn ý h1 → h2 → h3 không bị nhảy cấp.
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const acceptedCount = topic._count.registrations;
  const availability = getAvailability({ status: topic.status, maxStudents: topic.maxStudents, acceptedCount });

  return (
    <li className="group relative py-5 transition-colors duration-200 before:absolute before:inset-y-4 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:rounded-full before:bg-primary before:transition-transform before:duration-300 hover:bg-card hover:before:scale-y-100 sm:px-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <Heading className="min-w-0 flex-1 basis-64 text-lg leading-snug font-semibold">
          <Link
            href={`/topics/${topic.id}`}
            className="outline-none after:absolute after:inset-0 group-hover:text-link group-hover:underline focus-visible:underline"
          >
            {topic.title}
          </Link>
        </Heading>
        <AvailabilityBadge availability={availability} />
      </div>

      <p className="mt-1.5 line-clamp-2 max-w-3xl text-muted-foreground">{topic.description}</p>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Giảng viên</dt>
          <dd className="font-medium">{topic.lecturer.name}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Bộ môn</dt>
          <dd>{topic.department.name}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Đã nhận</dt>
          <dd className="flex items-center gap-2">
            {acceptedCount}/{topic.maxStudents} sinh viên
            <CapacityBar accepted={acceptedCount} max={topic.maxStudents} className="w-14" />
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Cập nhật</dt>
          <dd>{formatDate(topic.updatedAt)}</dd>
        </div>
      </dl>

      {topic.tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Thẻ">
          {topic.tags.map((tag) => (
            <li key={tag.slug} className="rounded border bg-card px-1.5 py-0.5 text-xs text-muted-foreground">
              {tag.name}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function TopicCard({ topic, headingLevel = 3 }: { topic: TopicCardData; headingLevel?: HeadingLevel }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const acceptedCount = topic._count.registrations;
  const availability = getAvailability({ status: topic.status, maxStudents: topic.maxStudents, acceptedCount });

  return (
    <li className="group relative flex min-h-72 flex-col rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-card motion-safe:hover:-translate-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm text-muted-foreground">{topic.department.name}</span>
        <AvailabilityBadge availability={availability} />
      </div>

      <Heading className="mt-4 line-clamp-2 text-lg leading-snug font-semibold">
        <Link
          href={`/topics/${topic.id}`}
          className="outline-none after:absolute after:inset-0 group-hover:text-link focus-visible:underline"
        >
          {topic.title}
        </Link>
      </Heading>
      <p className="mt-2 line-clamp-3 text-muted-foreground">{topic.description}</p>

      {topic.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Thẻ">
          {topic.tags.map((tag) => (
            <li key={tag.slug} className="rounded border bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
              {tag.name}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-4 border-t pt-3">
        <p className="min-w-0 truncate text-sm font-medium">{topic.lecturer.name}</p>
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <span>
            {acceptedCount}/{topic.maxStudents}
          </span>
          <CapacityBar accepted={acceptedCount} max={topic.maxStudents} className="w-12" />
        </div>
      </div>
    </li>
  );
}

export function TopicList({
  topics,
  headingLevel,
  layout = "rows",
}: {
  topics: TopicCardData[];
  headingLevel?: HeadingLevel;
  layout?: TopicListLayout;
}) {
  const isCards = layout === "cards";

  return (
    <ul
      aria-label={isCards ? "Đề tài nổi bật" : undefined}
      className={cn(
        "animate-in duration-500 fade-in slide-in-from-bottom-2",
        isCards ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "divide-y border-y",
      )}
    >
      {topics.map((topic) => (
        isCards ? (
          <TopicCard key={topic.id} topic={topic} headingLevel={headingLevel} />
        ) : (
          <TopicRow key={topic.id} topic={topic} headingLevel={headingLevel} />
        )
      ))}
    </ul>
  );
}

/** Khung chờ có cùng chiều cao với danh sách thật để trang không bị giật khi dữ liệu về. */
export function TopicListSkeleton({ count = 4, layout = "rows" }: { count?: number; layout?: TopicListLayout }) {
  if (layout === "cards") {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="flex min-h-80 flex-col rounded-xl border bg-card p-5 sm:p-6">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="mt-5 h-6 w-4/5" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
            <Skeleton className="mt-4 h-6 w-2/3" />
            <Skeleton className="mt-auto h-12 w-full" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="divide-y border-y" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3 py-5 sm:px-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-4/5 max-w-2xl" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
