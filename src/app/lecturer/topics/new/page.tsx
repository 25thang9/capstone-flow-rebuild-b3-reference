import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { listDepartments, listTags } from "@/features/catalog/queries";
import { createTopicAction } from "@/features/topics/actions";
import { TopicForm } from "@/features/topics/components/topic-form";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Thêm đề tài" };

export default function NewTopicPage() {
  return (
    <>
      <PageHeader
        title="Đăng đề tài mới"
        description="Điền những gì sinh viên cần biết để quyết định đăng ký. Bạn sửa lại được bất cứ lúc nào."
        crumbs={[{ label: "Đề tài của tôi", href: "/lecturer/topics" }, { label: "Thêm đề tài" }]}
      />
      <Suspense fallback={<Skeleton className="h-[40rem] w-full" />}>
        <NewTopicForm />
      </Suspense>
    </>
  );
}

async function NewTopicForm() {
  await requireRole("LECTURER");
  const [departments, tags] = await Promise.all([listDepartments(), listTags()]);
  return <TopicForm action={createTopicAction} departments={departments} tags={tags} submitLabel="Đăng đề tài" />;
}
