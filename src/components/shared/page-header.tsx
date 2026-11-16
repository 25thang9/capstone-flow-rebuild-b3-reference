import { Fragment } from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = { label: string; href?: string };

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  /** Nút hành động chính của trang, nằm bên phải tiêu đề. */
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, crumbs, actions }: PageHeaderProps) {
  return (
    <div className="pb-6">
      {crumbs ? <Crumbs items={crumbs} /> : null}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
