import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { listDepartments, listTags } from "@/features/catalog/queries";
import { updateTopicAction } from "@/features/topics/actions";
import { TopicForm } from "@/features/topics/components/topic-form";
import { getMyTopic } from "@/features/topics/queries";

export const metadata: Metadata = { title: "Sửa đề tài" };

export default function EditTopicPage({ params }: PageProps<"/lecturer/topics/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Sửa đề tài"
        description="Thay đổi có hiệu lực ngay trong Kho đề tài sau khi lưu."
        crumbs={[{ label: "Đề tài của tôi", href: "/lecturer/topics" }, { label: "Sửa đề tài" }]}
      />
      <Suspense fallback={<Skeleton className="h-[40rem] w-full" />}>
        <EditTopicForm params={params} />
      </Suspense>
    </>
  );
}

async function EditTopicForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // getMyTopic chỉ trả về đề tài của giảng viên đang đăng nhập; đề tài của người khác → 404.
  const [topic, departments, tags] = await Promise.all([getMyTopic(id), listDepartments(), listTags()]);
  if (!topic) notFound();

  return (
    <TopicForm
      action={updateTopicAction.bind(null, topic.id)}
      departments={departments}
      tags={tags}
      acceptedCount={topic._count.registrations}
      submitLabel="Lưu thay đổi"
      topic={{
        title: topic.title,
        description: topic.description,
        objectives: topic.objectives ?? "",
        requirements: topic.requirements ?? "",
        departmentId: topic.departmentId,
        maxStudents: topic.maxStudents,
        status: topic.status,
        tagIds: topic.tags.map((tag) => tag.id),
      }}
    />
  );
}
