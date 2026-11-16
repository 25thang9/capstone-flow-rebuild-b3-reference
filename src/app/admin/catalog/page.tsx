import { Suspense } from "react";
import type { Metadata } from "next";

import { ConfirmAction } from "@/components/shared/confirm-action";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createCatalogItemAction,
  deleteCatalogItemAction,
  renameCatalogItemAction,
} from "@/features/catalog/actions";
import { CatalogAddForm, CatalogRenameDialog } from "@/features/catalog/components/catalog-forms";
import { type CatalogItem, listDepartments, listTags } from "@/features/catalog/queries";
import type { CatalogKind } from "@/features/catalog/schema";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Danh mục" };

export default function AdminCatalogPage() {
  return (
    <>
      <PageHeader
        title="Danh mục"
        description="Bộ môn và thẻ mà giảng viên chọn khi đăng đề tài, cũng là bộ lọc của Kho đề tài."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Catalog />
      </Suspense>
    </>
  );
}

async function Catalog() {
  await requireRole("ADMIN");
  const [departments, tags] = await Promise.all([listDepartments(), listTags()]);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <CatalogSection
        kind="department"
        title="Bộ môn"
        note="Mỗi đề tài thuộc đúng một bộ môn. Bộ môn đang có đề tài thì không xoá được."
        addLabel="Thêm bộ môn"
        items={departments}
      />
      <CatalogSection
        kind="tag"
        title="Thẻ công nghệ, lĩnh vực"
        note="Một đề tài gắn được nhiều thẻ. Xoá thẻ chỉ gỡ thẻ khỏi đề tài, không xoá đề tài."
        addLabel="Thêm thẻ"
        items={tags}
      />
    </div>
  );
}

type CatalogSectionProps = {
  kind: CatalogKind;
  title: string;
  note: string;
  addLabel: string;
  items: CatalogItem[];
};

function CatalogSection({ kind, title, note, addLabel, items }: CatalogSectionProps) {
  const headingId = `${kind}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-xl font-semibold">
        {title} <span className="font-sans text-base font-normal text-muted-foreground">({items.length})</span>
      </h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground lg:min-h-10">{note}</p>

      <CatalogAddForm action={createCatalogItemAction.bind(null, kind)} label={addLabel} inputId={`${kind}-name`} />

      <ul className="mt-6 divide-y border-y">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item._count.topics} đề tài</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <CatalogRenameDialog action={renameCatalogItemAction.bind(null, kind, item.id)} currentName={item.name} />
              <ConfirmAction
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Xoá ${item.name}`}
                  >
                    Xoá
                  </Button>
                }
                title={`Xoá “${item.name}”?`}
                description={
                  kind === "tag" && item._count.topics > 0
                    ? `Thẻ sẽ được gỡ khỏi ${item._count.topics} đề tài đang dùng.`
                    : "Thao tác này không hoàn tác được."
                }
                confirmLabel="Xoá"
                destructive
                action={deleteCatalogItemAction.bind(null, kind, item.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
