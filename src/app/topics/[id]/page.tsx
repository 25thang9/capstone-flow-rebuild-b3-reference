import { Suspense, cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Crumbs } from "@/components/shared/page-header";
import { AvailabilityBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationPanel } from "@/features/registrations/components/registration-panel";
import { getAvailability, remainingSlots } from "@/features/registrations/rules";
import { CapacityBar } from "@/features/topics/components/topic-list";
import { getPublicTopic } from "@/features/topics/queries";
import { formatDate } from "@/lib/text";

// cache(): generateMetadata và trang cùng gọi nhưng database chỉ bị truy vấn một lần mỗi request.
const loadTopic = cache(getPublicTopic);

export async function generateMetadata({ params }: PageProps<"/topics/[id]">): Promise<Metadata> {
  const { id } = await params;
  const topic = await loadTopic(id);
  if (!topic) return { title: "Không tìm thấy đề tài" };
  return { title: topic.title, description: topic.description.slice(0, 160) };
}

export default function TopicDetailPage({ params }: PageProps<"/topics/[id]">) {
  return (
    <div className="container-page py-10">
      <Suspense fallback={<TopicDetailSkeleton />}>
        <TopicDetail params={params} />
      </Suspense>
    </div>
  );
}

async function TopicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await loadTopic(id);
  if (!topic) notFound();

  const capacity = {
    status: topic.status,
    maxStudents: topic.maxStudents,
    acceptedCount: topic._count.registrations,
  };
  const slotsLeft = remainingSlots(capacity);

  const sections = [
    { heading: "Mô tả đề tài", body: topic.description },
    { heading: "Mục tiêu", body: topic.objectives },
    { heading: "Yêu cầu đối với sinh viên", body: topic.requirements },
  ].filter((section) => section.body);

  return (
    <article className="animate-in duration-500 fade-in slide-in-from-bottom-2">
      <Crumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Kho đề tài", href: "/topics" }, { label: "Chi tiết đề tài" }]}
      />

      <header className="border-b pb-6">
        <AvailabilityBadge availability={getAvailability(capacity)} />
        <h1 className="mt-3 max-w-4xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {topic.title}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {topic.lecturer.name} · {topic.department.name}
        </p>
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <p className="user-text mt-2 max-w-prose leading-7">{section.body}</p>
            </section>
          ))}

          {topic.tags.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold">Công nghệ và lĩnh vực</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {topic.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={`/topics?tag=${tag.slug}`}
                      className="inline-block rounded border bg-card px-2.5 py-1 text-sm hover:border-primary hover:text-link"
                    >
                      {tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <dl className="divide-y rounded-lg border bg-card text-sm">
            <Fact label="Giảng viên hướng dẫn" value={topic.lecturer.name} />
            <Fact label="Bộ môn" value={topic.department.name} />
            <Fact
              label="Số lượng"
              value={`Đã nhận ${capacity.acceptedCount}/${topic.maxStudents} · còn ${slotsLeft} chỗ`}
            />
            <Fact label="Cập nhật" value={formatDate(topic.updatedAt)} />
            <div className="px-4 py-3">
              <CapacityBar accepted={capacity.acceptedCount} max={topic.maxStudents} className="block w-full" />
            </div>
          </dl>

          {/* Ô đăng ký phụ thuộc phiên đăng nhập nên có ranh giới riêng: nội dung đề tài không phải chờ nó. */}
          <Suspense fallback={<Skeleton className="h-56 w-full" />}>
            <RegistrationPanel topicId={topic.id} lecturerId={topic.lecturerId} capacity={capacity} />
          </Suspense>
        </aside>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function TopicDetailSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="mt-6 h-10 w-3/4" />
      <Skeleton className="mt-4 h-4 w-64" />
      <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
}
