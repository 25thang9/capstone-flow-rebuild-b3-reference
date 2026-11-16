import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type Stat = {
  label: string;
  value: number;
  /** Dòng chú thích nhỏ bên dưới con số. */
  hint?: string;
  href?: string;
  icon?: LucideIcon;
};

/** Hàng số liệu tổng quan. Các ô ngăn nhau bằng đường kẻ mảnh (gap-px trên nền màu viền). */
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid animate-in grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border duration-500 fade-in lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="group relative bg-card p-5 transition-colors hover:bg-secondary/60">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-sm text-muted-foreground">
              {stat.href ? (
                <Link href={stat.href} className="after:absolute after:inset-0 group-hover:text-link">
                  {stat.label}
                </Link>
              ) : (
                stat.label
              )}
            </dt>
            {stat.icon ? (
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground"
              >
                <stat.icon className="size-4" />
              </span>
            ) : null}
          </div>
          <dd className="mt-1 font-heading text-4xl font-semibold tabular-nums">{stat.value}</dd>
          {stat.hint ? <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}
